import { create } from "zustand";
import { EditorState, TreeElementNode, TreeNode } from "@/types";

export const useEditor = create<EditorState>((set) => ({
  tree: null,
  componentId: null,
  source: '<div className="text-xl text-muted">Hello World</div>',
  selectedId: null,
  loading: false,

  setTree: (tree) => set({ tree }),
  setComponentId: (id) => set({ componentId: id }),
  setSource: (source) => set({ source }),
  selectNode: (id) => set({ selectedId: id || null }),
  setLoading: (loading) => set({ loading }),

  updateNode: (id, updater) =>
    set((state) => ({
      tree: updateTree(state.tree, id, updater),
    })),

  updateNodeText: (id, text) =>
    set((state) => ({
      tree: updateTree(state.tree, id, (node) => setNodeText(node, text)),
    })),
}));

function setNodeText(node: TreeNode, text: string) {
  if ("value" in node) {
    node.value = text;
    return;
  }

  if (node.children.length === 1 && "value" in node.children[0]) {
    node.children[0].value = text;
  }
}

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
