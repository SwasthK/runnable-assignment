"use client"

import { createElement, useState } from "react";
import { useEditor } from "@/store/editor";
import { TreeElementNode, TreeTextNode } from "@/types";

type TreeNode = TreeElementNode | TreeTextNode;

export function RenderNode({ node }: { node: TreeNode }) {
  const { selectedId, selectNode } = useEditor();
  const [hovered, setHovered] = useState(false);

  if (node.type === "text") {
    return <>{(node as TreeTextNode).value}</>;
  }

  const el = node as TreeElementNode;
  const isSelected = el.id === selectedId;
  const showLabel = isSelected || hovered;

  return (
    <div style={{ position: "relative", display: "contents" }}>
      {showLabel && (
        <span style={{
          position: "absolute", top: -16, left: 0, zIndex: 50,
          fontSize: 10, lineHeight: "14px", padding: "0 4px",
          background: isSelected ? "#3b82f6" : "#93c5fd",
          color: "white", pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          {el.type}
        </span>
      )}
      {createElement(el.type, {
        className: el.props.className,
        style: {
          ...el.props.style,
          outline: isSelected ? "2px solid #3b82f6" : hovered ? "1px dashed #93c5fd" : "none",
          cursor: "pointer",
        },
        onClick: (e: React.MouseEvent) => { e.stopPropagation(); selectNode(el.id); },
        onMouseEnter: (e: React.MouseEvent) => { e.stopPropagation(); setHovered(true); },
        onMouseLeave: () => setHovered(false),
      },
        ...el.children.map((child: TreeNode) => <RenderNode key={child.id} node={child} />)
      )}
    </div>
  );
}
