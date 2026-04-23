import { create } from "zustand";
import { EditorState, TreeElementNode, TreeNode } from "@/types";

export const useEditor = create<EditorState>((set) => ({
  tree: null,
  selectedId: null,

  setTree: (tree) => set({ tree }),
  selectNode: (id) => set({ selectedId: id || null }),

  updateNode: (id, updater) =>
    set((state) => ({
      tree: updateTree(state.tree, id, updater),
    })),
}));

function updateTree(
  node: TreeNode | null,
  id: string,
  updater: (node: TreeNode) => void
): TreeElementNode | null {
  if (!node) return null;

  if (node.id === id) {
    const newNode = { ...node };
    updater(newNode);
    return newNode as TreeElementNode;
  }

  if (node.type !== "text") {
    return {
      ...(node as TreeElementNode),
      children: (node as TreeElementNode).children.map((child) => updateTree(child, id, updater) ?? child) as TreeNode[],
    };
  }

  return null;
}
