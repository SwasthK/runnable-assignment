type TreeTextNode = {
  id: string;
  type: "text";
  value: string;
};

type TreeElementNode = {
  id: string;
  type: string;
  props: Record<string, string> & { style?: React.CSSProperties };
  children: (TreeElementNode | TreeTextNode)[];
};

type TreeNode = TreeElementNode | TreeTextNode;

type EditorState = {
  tree: TreeElementNode | null;
  selectedId: string | null;
  setTree: (tree: TreeElementNode | null) => void;
  selectNode: (id: string) => void;
  updateNode: (id: string, updater: (node: TreeNode) => void) => void;
};


export type { TreeTextNode, TreeElementNode, TreeNode, EditorState }