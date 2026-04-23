import { TreeElementNode, TreeNode } from "@/types";

export function findNode(node: TreeNode | null, id: string | null): TreeNode | null {
  if (!node || !id) return null;
  if (node.id === id) return node;
  for (const child of (node as TreeElementNode).children ?? []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}
