"use client"

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
import { Button } from "../ui/button"
import {
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { IframePreview } from "./iframe-preview"
import { useEditor } from "@/store/editor"

type PreviewProps = {
  codeInputOpen: boolean
  setCodeInputOpen: Dispatch<SetStateAction<boolean>>
  codeEditorOpen: boolean
  setCodeEditorOpen: Dispatch<SetStateAction<boolean>>
}

export default function Preview({
  codeInputOpen,
  setCodeInputOpen,
  codeEditorOpen,
  setCodeEditorOpen,
}: PreviewProps) {
  const tree = useEditor((s) => s.tree)
  const source = useEditor((s) => s.source)
  const componentId = useEditor((s) => s.componentId)
  const loading = useEditor((s) => s.loading)
  const [saving, setSaving] = useState(false)
  const canSave = Boolean(componentId && tree) && !saving

  const onPanelClick = (direction: "left" | "right") => {
    const isMobile = window.innerWidth < 768
    if (direction === "left") {
      if (isMobile) setCodeEditorOpen(false)
      setCodeInputOpen((v) => !v)
    } else {
      if (isMobile) setCodeInputOpen(false)
      setCodeEditorOpen((v) => !v)
    }
  }

  const onSave = useCallback(async () => {
    if (!componentId || !tree || saving) return

    setSaving(true)
    try {
      await fetch(`/api/component/${componentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, tree }),
      })
    } finally {
      setSaving(false)
    }
  }, [componentId, saving, source, tree])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isSaveShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s"
      if (!isSaveShortcut) return

      event.preventDefault()
      onSave()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onSave])

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-background">
      <div className="flex h-10 shrink-0 items-center justify-between border-b px-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onPanelClick("left")}
            >
              {codeInputOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{codeInputOpen ? "Close" : "Open"} Input</p>
          </TooltipContent>
        </Tooltip>
        <span className="text-sm font-medium">Preview</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canSave}
            onClick={onSave}
            className="h-7 px-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : "Save"}
          </Button>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onPanelClick("right")}
                >
                  {codeEditorOpen ? (
                    <PanelRightClose className="h-4 w-4" />
                  ) : (
                    <PanelRightOpen className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{codeEditorOpen ? "Close" : "Open"} Editor</p>
              </TooltipContent>
            </Tooltip>
            <span className="text-xs text-muted-foreground">
              {componentId ? `id: ${componentId.slice(0, 8)}` : "not saved"}
            </span>
          </div>
        </div>
      </div>
      <div className="relative flex-1 overflow-auto bg-gray-50 shadow-sm">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        <IframePreview />
      </div>
    </div>
  )
}
