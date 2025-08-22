import { type NextRequest, NextResponse } from "next/server"
import { ChatGroq } from "@langchain/groq"
import { StructuredOutputParser } from "langchain/output_parsers"
import { PromptTemplate } from "@langchain/core/prompts"
import { z } from "zod"
import { db } from "@/lib/db"
import { projects, tasks, chunks, users, sessions } from "@/lib/db/schema"
import { createId } from "@paralleldrive/cuid2"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Schema for AI-generated project breakdown
const ProjectBreakdownSchema = z.object({
  project: z.object({
    title: z.string(),
    description: z.string(),
    estimatedHours: z.number(),
    complexity: z.enum(["simple", "moderate", "complex"]),
  }),
  tasks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      estimateMin: z.number(),
      priority: z.enum(["low", "medium", "high"]),
      chunks: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          durationMin: z.number().min(5).max(15),
          energy: z.enum(["low", "med", "high"]),
          resources: z.array(z.string()),
          acceptanceCriteria: z.string(),
          dependencies: z.array(z.string()).default([]),
        }),
      ),
    }),
  ),
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Initializing database connection...")

    if (!process.env.GROQ_API_KEY) {
      console.error("[v0] GROQ_API_KEY environment variable is not set")
      return NextResponse.json(
        { error: "Groq API key not configured. Please add GROQ_API_KEY to environment variables." },
        { status: 500 },
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("[v0] Database connection initialized successfully")

    const body = await request.json()
    const { title, description, deadline, priority, context } = body

    const sessionUserId = session.user.id || session.user.email

    // Check if user exists, create if not
    let user = await db.select().from(users).where(eq(users.id, sessionUserId)).limit(1)

    if (user.length === 0) {
      console.log("[v0] Creating new user record for:", session.user.email)
      // Create user record from session data
      await db.insert(users).values({
        id: sessionUserId,
        email: session.user.email,
        name: session.user.name || session.user.email.split("@")[0],
        timezone: "UTC",
        workHours: { start: "09:00", end: "17:00" },
        energyProfile: { morning: 80, afternoon: 60, evening: 40 },
        defaultChunkMinutes: 10,
      })

      // Fetch the newly created user
      user = await db.select().from(users).where(eq(users.id, sessionUserId)).limit(1)
    }

    const userId = sessionUserId

    // Get user preferences and history for personalization
    const userHistory = await db
      .select({
        chunkTitle: chunks.title,
        chunkDescription: chunks.description,
        energy: chunks.energy,
        durationMin: chunks.durationMin,
        outcome: sessions.outcome,
        reflection: sessions.reflection,
      })
      .from(sessions)
      .innerJoin(chunks, eq(sessions.chunkId, chunks.id))
      .innerJoin(tasks, eq(chunks.taskId, tasks.id))
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .where(eq(projects.userId, userId))
      .limit(20) // Get recent history

    // Build personalized context
    let personalizedContext = ""
    if (user.length > 0 && userHistory.length > 0) {
      const userData = user[0]
      const successfulChunks = userHistory.filter((h) => h.outcome === "done")
      const stuckChunks = userHistory.filter((h) => h.outcome === "stuck")

      personalizedContext = `
PERSONALIZATION CONTEXT:
User's Energy Profile: Morning ${userData.energyProfile?.morning || 80}%, Afternoon ${userData.energyProfile?.afternoon || 60}%, Evening ${userData.energyProfile?.evening || 40}%
Default Chunk Duration: ${userData.defaultChunkMinutes || 10} minutes
Work Hours: ${userData.workHours?.start || "09:00"} to ${userData.workHours?.end || "17:00"}

SUCCESSFUL PATTERNS (from completed chunks):
${successfulChunks
  .slice(0, 5)
  .map(
    (chunk) =>
      `- ${chunk.chunkTitle} (${chunk.energy} energy, ${chunk.durationMin}min): ${chunk.reflection || "No reflection"}`,
  )
  .join("\n")}

CHALLENGING PATTERNS (from stuck chunks):
${stuckChunks
  .slice(0, 3)
  .map((chunk) => `- ${chunk.chunkTitle} (${chunk.energy} energy): ${chunk.reflection || "Got stuck"}`)
  .join("\n")}

Use this context to create chunks that match the user's successful patterns and avoid their challenging patterns.
`
    }

    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
    })

    // Create structured output parser
    const parser = StructuredOutputParser.fromZodSchema(ProjectBreakdownSchema)

    // Enhanced prompt with personalization
    const promptTemplate =
      PromptTemplate.fromTemplate(`You are an expert productivity coach specializing in breaking down overwhelming projects into manageable 10-minute work chunks.

{personalizedContext}

TASK: Break down this project into a structured plan with tasks and 10-minute chunks.

PROJECT DETAILS:
Title: {title}
Description: {description}
Priority: {priority}
Deadline: {deadline}
Additional Context: {context}

BREAKDOWN REQUIREMENTS:
1. Create 3-7 main tasks that represent logical phases or components
2. Each task should have 2-8 chunks of 10-minute focused work
3. Chunks should be specific, actionable, and completable in 10 minutes
4. Consider energy levels: "high" for creative/complex work, "med" for standard tasks, "low" for routine work
5. Include specific acceptance criteria for each chunk
6. Note any dependencies between chunks
7. Suggest helpful resources or tools for each chunk

PERSONALIZATION GUIDELINES:
- Match successful chunk patterns from user history
- Avoid patterns that led to stuck sessions
- Align energy requirements with user's energy profile
- Use preferred chunk duration (10 minutes as baseline)

CHUNK GUIDELINES:
- 10 minutes is the target (5-15 min range acceptable)
- Be specific about what to accomplish
- Include clear success criteria
- Consider cognitive load and energy requirements
- Sequence logically with dependencies

Focus on making this feel manageable and achievable rather than overwhelming.

{format_instructions}`)

    const chain = promptTemplate.pipe(model).pipe(parser)

    const result = await chain.invoke({
      title,
      description,
      priority,
      deadline: deadline || "Not specified",
      context: context || "None provided",
      personalizedContext,
      format_instructions: parser.getFormatInstructions(),
    })

    // Save to database
    const projectId = createId()

    // Insert project
    await db.insert(projects).values({
      id: projectId,
      userId,
      title: result.project.title,
      description: result.project.description,
      deadline: deadline ? new Date(deadline) : null,
      priority: priority as "low" | "medium" | "high",
    })

    // Insert tasks and chunks
    for (const [taskIndex, task] of result.tasks.entries()) {
      const taskId = createId()

      await db.insert(tasks).values({
        id: taskId,
        projectId,
        title: task.title,
        notes: task.description,
        estimateMin: task.estimateMin,
      })

      // Insert chunks for this task
      for (const [chunkIndex, chunk] of task.chunks.entries()) {
        await db.insert(chunks).values({
          id: createId(),
          taskId,
          title: chunk.title,
          description: chunk.description,
          durationMin: chunk.durationMin,
          energy: chunk.energy,
          resources: chunk.resources,
          acceptanceCriteria: chunk.acceptanceCriteria,
          deps: chunk.dependencies,
          orderIndex: chunkIndex,
        })
      }
    }

    return NextResponse.json({
      success: true,
      projectId,
      breakdown: result,
    })
  } catch (error) {
    console.error("Error creating project breakdown:", error)
    return NextResponse.json({ error: "Failed to create project breakdown" }, { status: 500 })
  }
}
