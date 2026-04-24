import { NextResponse } from "next/server"
import { desc } from "drizzle-orm"
import { db } from "@/db"
import { components } from "@/db/schema"
import { TreeElementNode } from "@/types"

type CreateComponentBody = {
  source?: string
  tree?: TreeElementNode | null
}

export async function GET() {
  try {
    const rows = await db
      .select({
        id: components.id,
        source: components.source,
        updatedAt: components.updatedAt,
      })
      .from(components)
      .orderBy(desc(components.updatedAt))

    return NextResponse.json(rows, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: "failed to list components" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateComponentBody

    if (!body.source || typeof body.source !== "string") {
      return NextResponse.json({ error: "source is required" }, { status: 400 })
    }

    const [component] = await db
      .insert(components)
      .values({
        source: body.source,
        tree: body.tree ?? null,
      })
      .returning()

    return NextResponse.json(component, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "failed to create component" },
      { status: 500 }
    )
  }
}
