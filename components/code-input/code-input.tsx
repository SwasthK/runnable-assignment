"use client"

import { cn } from "@/lib/utils"
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
import { useEditor } from "@/store/editor"
import { ComponentListItem, StoredComponent } from "@/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, ArrowLeft } from "lucide-react"
import { parseJSX } from "@/lib/parse-jsx"
import { astToTree } from "@/lib/ast-to-tree"

export default function CodeInput({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) {
  const [items, setItems] = useState<ComponentListItem[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [newView, setNewView] = useState(false)
  const [draft, setDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { setSource, setTree, setComponentId, selectNode, componentId, setLoading } = useEditor()

  const applyComponent = useCallback(
    (component: StoredComponent) => {
      setSource(component.source)
      setTree(component.tree)
      setComponentId(component.id)
      selectNode("")
      window.history.replaceState(null, "", `?id=${component.id}`)
    },
    [selectNode, setComponentId, setSource, setTree]
  )

  const loadList = useCallback(async () => {
    try {
      const res = await fetch("/api/component")
      if (!res.ok) return

      setItems((await res.json()) as ComponentListItem[])
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadList()
    const handler = () => {
      setListLoading(true)
      void loadList()
    }
    window.addEventListener("components:changed", handler)
    return () => window.removeEventListener("components:changed", handler)
  }, [loadList])

  const handleSelect = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/preview/${id}`)
      if (!res.ok) return

      const component = (await res.json()) as StoredComponent
      applyComponent(component)
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = async () => {
    const source = draft
    if (!source.trim()) return

    setLoading(true)
    setSubmitting(true)
    try {
      const tree = astToTree(parseJSX(source))
      const res = await fetch("/api/component", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, tree }),
      })
      if (!res.ok) return

      const { id } = (await res.json()) as { id: string }
      applyComponent({ id, source, tree })
      window.dispatchEvent(new Event("components:changed"))
      setNewView(false)
      setDraft("")
    } catch {
      // Parsing or network errors keep current editor state unchanged.
    } finally {
      setSubmitting(false)
      setLoading(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          "flex flex-col border-r bg-background transition-all duration-300 overflow-hidden z-20",
          "fixed inset-y-0 left-0 md:relative md:inset-auto",
          open ? "w-72" : "w-0"
        )}
      >
        {newView ? (
          <>
            <div className="flex h-10 items-center gap-2 border-b px-2 shrink-0">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setNewView(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium flex-1">New Component</span>
              <Button size="sm" className="h-7 px-3 text-xs" onClick={handleLoad} disabled={submitting}>
                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Load"}
              </Button>
            </div>
            <div className="flex-1 overflow-hidden p-3">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Paste JSX here…"
                className="h-full w-full resize-none font-mono text-xs"
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 items-center justify-between border-b px-3 shrink-0">
              <span className="text-sm font-medium">Components</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setNewView(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-1">
              {listLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : items.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted-foreground">No components yet</p>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      "w-full rounded-md border px-2 py-1.5 text-left text-xs hover:bg-muted/50 transition-colors",
                      item.id === componentId ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="truncate font-mono text-[10px] text-muted-foreground mb-0.5">
                      {new Date(item.updatedAt).toLocaleString()}
                    </div>
                    <div className="truncate">{item.source.replace(/\s+/g, " ").slice(0, 60)}</div>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-10 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
