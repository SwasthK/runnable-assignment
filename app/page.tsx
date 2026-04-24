"use client"

import { useState, useEffect } from "react"
import CodeInput from "@/components/code-input/code-input"
import CodeEditor from "@/components/code-editor/code-editor"
import Preview from "@/components/preview/preview"
import { useEditor } from "@/store/editor"
import { ComponentListItem, StoredComponent } from "@/types"

export default function Page() {
  const [codeInputOpen, setCodeInputOpen] = useState(true)
  const [codeEditorOpen, setCodeEditorOpen] = useState(true)
  const setTree = useEditor((s) => s.setTree)
  const setComponentId = useEditor((s) => s.setComponentId)
  const setSource = useEditor((s) => s.setSource)
  const setLoading = useEditor((s) => s.setLoading)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && codeInputOpen && codeEditorOpen) {
        setCodeEditorOpen(false)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [codeInputOpen, codeEditorOpen])

  useEffect(() => {
    let active = true

    const loadPreviewById = async (id: string) => {
      const res = await fetch(`/api/preview/${id}`)
      if (!res.ok || !active) return null

      const component = (await res.json()) as StoredComponent
      if (!active) return null

      setSource(component.source)
      setTree(component.tree)
      setComponentId(component.id)
      return component
    }

    const loadComponent = async () => {
      setLoading(true)
      try {
        const id = new URLSearchParams(window.location.search).get("id")

        if (id) {
          const component = await loadPreviewById(id)
          if (component) return
        }

        const listRes = await fetch("/api/component")
        if (!listRes.ok || !active) return

        const [latest] = (await listRes.json()) as ComponentListItem[]
        if (!latest?.id) return

        const component = await loadPreviewById(latest.id)
        if (!component || !active) return

        const params = new URLSearchParams(window.location.search)
        params.set("id", component.id)
        const query = params.toString()
        window.history.replaceState(null, "", query ? `/?${query}` : "/")
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadComponent()
    return () => {
      active = false
    }
  }, [setComponentId, setLoading, setSource, setTree])

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="flex border h-full w-full">
        <CodeInput open={codeInputOpen} setOpen={setCodeInputOpen} />
        <Preview
          codeInputOpen={codeInputOpen}
          setCodeInputOpen={setCodeInputOpen}
          codeEditorOpen={codeEditorOpen}
          setCodeEditorOpen={setCodeEditorOpen}
        />
        <CodeEditor open={codeEditorOpen} setOpen={setCodeEditorOpen} />
      </div>
    </div>
  )
}
