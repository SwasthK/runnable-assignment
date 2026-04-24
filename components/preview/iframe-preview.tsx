"use client"

import { useEffect, useRef, useState } from "react"
import { useEditor } from "@/store/editor"
import { TreeElementNode, TreeNode, TreeTextNode } from "@/types"

const EMPTY_PREVIEW_HTML =
  "<p style='color:#888'>Load JSX to preview it here.</p>"

const PREVIEW_STYLES = `
  [data-id] { cursor: pointer; position: relative; }
  [data-id]:hover:not(:has([data-id]:hover)) { outline: 1px dashed #93c5fd; }
  [data-id]:hover:not(:has([data-id]:hover))::before { content: attr(data-tag); position: absolute; top: -16px; left: 0; font-size: 10px; line-height: 14px; padding: 0 4px; background: #93c5fd; color: white; pointer-events: none; white-space: nowrap; z-index: 50; }
  [data-id].selected { outline: 2px solid #3b82f6 !important; }
  [data-id].selected::before { content: attr(data-tag); position: absolute; top: -16px; left: 0; font-size: 10px; line-height: 14px; padding: 0 4px; background: #3b82f6; color: white; pointer-events: none; white-space: nowrap; z-index: 50; }
`

const PREVIEW_SCRIPT = `
  document.body.addEventListener("click", function (event) {
    const element = event.target.closest("[data-id]");

    if (!element) {
      window.parent.postMessage({ type: "select", id: null }, "*");
      return;
    }

    event.stopPropagation();
    document.querySelectorAll(".selected").forEach(function (node) {
      node.classList.remove("selected");
    });
    element.classList.add("selected");

    window.parent.postMessage({ type: "select", id: element.dataset.id }, "*");
  });
`

function toKebabCase(value: string) {
  return value.replace(/([A-Z])/g, "-$1").toLowerCase()
}

function serializeStyle(style: TreeElementNode["props"]["style"]) {
  if (!style) return ""

  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([property, value]) => `${toKebabCase(property)}:${value}`)
    .join(";")
}

function treeToHtml(node: TreeNode): string {
  if (node.type === "text") return (node as TreeTextNode).value

  const el = node as TreeElementNode
  const classAttribute = el.props.className
    ? ` class="${el.props.className}"`
    : ""
  const style = serializeStyle(el.props.style)
  const styleAttribute = style ? ` style="${style}"` : ""
  const children = el.children.map(treeToHtml).join("")

  return `<${el.type}${classAttribute}${styleAttribute} data-id="${el.id}" data-tag="${el.type}">${children}</${el.type}>`
}

function buildPreviewDocument(html: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>${PREVIEW_STYLES}</style>
</head>
<body class="p-4">
${html}
<script>${PREVIEW_SCRIPT}</script>
</body>
</html>`
}

function syncSelectedNode(doc: Document, selectedId: string | null) {
  doc
    .querySelectorAll(".selected")
    .forEach((node) => node.classList.remove("selected"))

  if (selectedId) {
    doc.querySelector(`[data-id="${selectedId}"]`)?.classList.add("selected")
  }
}

export function IframePreview() {
  const tree = useEditor((s) => s.tree)
  const selectedId = useEditor((s) => s.selectedId)
  const selectNode = useEditor((s) => s.selectNode)
  const ref = useRef<HTMLIFrameElement>(null)
  const [srcdoc, setSrcdoc] = useState(() =>
    buildPreviewDocument(EMPTY_PREVIEW_HTML)
  )

  useEffect(() => {
    const html = tree ? treeToHtml(tree) : EMPTY_PREVIEW_HTML
    setSrcdoc(buildPreviewDocument(html))
  }, [tree])

  // Sync selected highlight when selectedId changes without re-render
  useEffect(() => {
    const doc = ref.current?.contentDocument
    if (!doc) return

    syncSelectedNode(doc, selectedId)
  }, [selectedId])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== "select") return
      selectNode(e.data.id ?? "")
    }

    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [selectNode])

  return <iframe ref={ref} srcDoc={srcdoc} className="h-full w-full border-0" />
}
