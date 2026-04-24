"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
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
  [data-id][data-editing="true"] { outline: 2px solid #2563eb !important; cursor: text; }
`

const PREVIEW_SCRIPT = `
  document.body.addEventListener("click", function (event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target || target.closest('[data-editing="true"]')) return;
    const element = target.closest("[data-id]");

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

  document.body.addEventListener("dblclick", function (event) {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const element = target.closest('[data-id][data-editable="true"]');
    if (!element) return;

    event.preventDefault();
    event.stopPropagation();

    const originalText = (element.textContent || "").trim();
    element.setAttribute("contenteditable", "true");
    element.setAttribute("data-editing", "true");
    element.focus();

    function finish(commit) {
      const text = (element.textContent || "").trim();
      element.removeAttribute("contenteditable");
      element.removeAttribute("data-editing");
      if (!commit || text === originalText) return;
      window.parent.postMessage({ type: "edit-text", id: element.dataset.id, text }, "*");
    }

    function onBlur() {
      element.removeEventListener("keydown", onKeyDown);
      finish(true);
    }

    function onKeyDown(keyEvent) {
      if (keyEvent.key === "Enter") {
        keyEvent.preventDefault();
        element.blur();
      }

      if (keyEvent.key === "Escape") {
        keyEvent.preventDefault();
        element.textContent = originalText;
        element.blur();
        finish(false);
      }
    }

    element.addEventListener("blur", onBlur, { once: true });
    element.addEventListener("keydown", onKeyDown);
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

function isTextNode(node: TreeNode): node is TreeTextNode {
  return node.type === "text"
}

function treeToHtml(node: TreeNode): string {
  if (isTextNode(node)) return node.value

  const classAttribute = node.props.className ? ` class="${node.props.className}"` : ""
  const style = serializeStyle(node.props.style)
  const styleAttribute = style ? ` style="${style}"` : ""
  const editableAttribute =
    node.children.length === 1 && isTextNode(node.children[0]) ? ' data-editable="true"' : ""
  const children = node.children.map(treeToHtml).join("")

  return `<${node.type}${classAttribute}${styleAttribute}${editableAttribute} data-id="${node.id}" data-tag="${node.type}">${children}</${node.type}>`
}

function buildPreviewDocument(html: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>${PREVIEW_STYLES}</style>
</head>
<body class="p-4">
<div id="preview-root">${html}</div>
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
  const updateNodeText = useEditor((s) => s.updateNodeText)
  const ref = useRef<HTMLIFrameElement>(null)
  const lastHtmlRef = useRef("")
  const srcdoc = useMemo(() => buildPreviewDocument(EMPTY_PREVIEW_HTML), [])

  const syncIframe = useCallback(() => {
    const doc = ref.current?.contentDocument
    if (!doc) return

    const root = doc.getElementById("preview-root")
    if (!root) return

    const nextHtml = tree ? treeToHtml(tree) : EMPTY_PREVIEW_HTML
    if (nextHtml !== lastHtmlRef.current) {
      root.innerHTML = nextHtml
      lastHtmlRef.current = nextHtml
    }

    syncSelectedNode(doc, selectedId)
  }, [tree, selectedId])

  useEffect(() => {
    syncIframe()
  }, [syncIframe])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "select") {
        selectNode(e.data.id ?? "")
        return
      }

      if (e.data?.type === "edit-text" && e.data?.id) {
        updateNodeText(e.data.id, String(e.data.text ?? ""))
      }
    }

    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [selectNode, updateNodeText])

  return (
    <iframe
      ref={ref}
      srcDoc={srcdoc}
      onLoad={syncIframe}
      className="h-full w-full border-0"
    />
  )
}
