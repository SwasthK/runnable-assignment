"use client"

import { useState, useEffect } from "react"
import CodeInput from "@/components/code-input/code-input"
import CodeEditor from "@/components/code-editor/code-editor"
import Preview from "@/components/preview/preview"

export default function Page() {
  const [codeInputOpen, setCodeInputOpen] = useState(false)
  const [codeEditorOpen, setCodeEditorOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && codeInputOpen && codeEditorOpen) {
        setCodeEditorOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [codeInputOpen, codeEditorOpen])

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
