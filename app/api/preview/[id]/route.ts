import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { components } from "@/db/schema"

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  try {
    const { id } = await params

    const [component] = await db
      .select()
      .from(components)
      .where(eq(components.id, id))
      .limit(1)

    if (!component) {
      return NextResponse.json({ error: "component not found" }, { status: 404 })
    }

    return NextResponse.json(component, { status: 200 })
  } catch {
    return NextResponse.json(
      { error: "failed to fetch component" },
      { status: 500 }
    )
  }
}
