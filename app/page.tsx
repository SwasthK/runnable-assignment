"use client"

import { useState, useEffect } from "react"
import CodeInput from "@/components/code-input/code-input"
import CodeEditor from "@/components/code-editor/code-editor"
import Preview from "@/components/preview/preview"
import { useEditor } from "@/store/editor"
import { StoredComponent } from "@/types"

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
    const id = new URLSearchParams(window.location.search).get("id")
    if (!id) return

    let active = true

    const loadComponent = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/preview/${id}`)
        if (!res.ok || !active) return

        const component = (await res.json()) as StoredComponent
        if (!active) return

        setSource(component.source)
        setTree(component.tree)
        setComponentId(component.id)
      } finally {
        setLoading(false)
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
