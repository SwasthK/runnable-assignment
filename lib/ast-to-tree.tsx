import traverse from "@babel/traverse";
import { nanoid } from "nanoid";
import type { ParseResult } from "@babel/parser";
import type { File, JSXElement, JSXAttribute, JSXText } from "@babel/types";
import { TreeElementNode, TreeTextNode } from "@/types";

export function astToTree(ast: ParseResult<File>): TreeElementNode | null {
  let root: TreeElementNode | null = null;

  traverse(ast, {
    JSXElement(path) {
      if (!root) {
        root = convertNode(path.node);
      }
    },
  });

  return root;
}

function convertNode(node: JSXElement): TreeElementNode {
  const nameNode = node.openingElement.name;
  const type = nameNode.type === "JSXIdentifier" ? nameNode.name : String(nameNode);

  return {
    id: nanoid(),
    type,
    props: getProps(node),
    children: node.children
      .map((child) => {
        if (child.type === "JSXText") {
          const text = (child as JSXText).value.trim();
          if (!text) return null;
          return { id: nanoid(), type: "text" as const, value: text };
        }
        if (child.type === "JSXElement") {
          return convertNode(child as JSXElement);
        }
        return null;
      })
      .filter((c): c is TreeElementNode | TreeTextNode => c !== null),
  };
}

function getProps(node: JSXElement): Record<string, string> {
  const props: Record<string, string> = {};

  node.openingElement.attributes.forEach((attr) => {
    if (
      attr.type === "JSXAttribute" &&
      (attr as JSXAttribute).name?.type === "JSXIdentifier" &&
      (attr as JSXAttribute).name.name === "className"
    ) {
      const val = (attr as JSXAttribute).value;
      if (val?.type === "StringLiteral") {
        props.className = val.value;
      }
    }
  });

  return props;
}
