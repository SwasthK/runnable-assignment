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

type StoredComponent = {
  id: string;
  source: string;
  tree: TreeElementNode | null;
};

type ComponentListItem = {
  id: string;
  source: string;
  updatedAt: string;
};

type EditorState = {
  tree: TreeElementNode | null;
  componentId: string | null;
  source: string;
  selectedId: string | null;
  loading: boolean;
  setTree: (tree: TreeElementNode | null) => void;
  setComponentId: (id: string | null) => void;
  setSource: (source: string) => void;
  selectNode: (id: string) => void;
  setLoading: (loading: boolean) => void;
  updateNode: (id: string, updater: (node: TreeNode) => void) => void;
  updateNodeText: (id: string, text: string) => void;
};


export type {
  TreeTextNode,
  TreeElementNode,
  TreeNode,
  StoredComponent,
  ComponentListItem,
  EditorState,
}
