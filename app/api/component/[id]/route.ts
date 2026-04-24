import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { components } from "@/db/schema"
import { TreeElementNode } from "@/types"

type UpdateComponentBody = {
  source?: string
  tree?: TreeElementNode | null
}

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = (await req.json()) as UpdateComponentBody

    if (body.source === undefined && body.tree === undefined) {
      return NextResponse.json(
        { error: "at least one of source or tree is required" },
        { status: 400 }
      )
    }

    const payload: {
      source?: string
      tree?: TreeElementNode | null
      updatedAt: Date
    } = { updatedAt: new Date() }

    if (body.source !== undefined) payload.source = body.source
    if (body.tree !== undefined) payload.tree = body.tree

    const [component] = await db
      .update(components)
      .set(payload)
      .where(eq(components.id, id))
      .returning()

    if (!component) {
      return NextResponse.json({ error: "component not found" }, { status: 404 })
    }

    return NextResponse.json(component, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: "failed to update component" },
      { status: 500 }
    )
  }
}
