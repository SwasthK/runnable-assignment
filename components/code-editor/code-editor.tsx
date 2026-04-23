"use client"

import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { useEditor } from "@/store/editor";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { findNode } from "@/lib/tree-utils";
import { TreeElementNode } from "@/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

function updateClass(className = "", prefix: string, value: string) {
  const filtered = className.split(" ").filter((c) => c && !c.startsWith(prefix));
  return [...filtered, value].join(" ");
}

export default function CodeEditor({ open, setOpen }: { open: boolean; setOpen: Dispatch<SetStateAction<boolean>> }) {
  const { tree, selectedId, updateNode } = useEditor();
  const node = findNode(tree, selectedId);

  return (
    <>
      <div
        className={cn(
          "flex flex-col border-l bg-background transition-all duration-300 overflow-hidden z-20",
          "fixed inset-y-0 right-0 md:relative md:inset-auto",
          open ? "w-80" : "w-0"
        )}
      >
        <div className="flex h-10 items-center border-b px-3 text-sm font-medium shrink-0">
          Editor
        </div>
        <div className="flex-1 overflow-auto">
          {!node ? (
            <div className="p-4 text-sm text-muted-foreground">Select an element</div>
          ) : (
            <div className="p-4 space-y-4">

              <Select onValueChange={(value) => updateNode(node.id, (n) => {
                const el = n as TreeElementNode;
                el.props.className = updateClass(el.props.className, "text-", value);
              })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Font Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="text-sm">Small</SelectItem>
                    <SelectItem value="text-base">Base</SelectItem>
                    <SelectItem value="text-xl">XL</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Button
                className="border p-2 w-full text-sm"
                onClick={() => updateNode(node.id, (n) => {
                  const el = n as TreeElementNode;
                  const hasBold = el.props.className?.includes("font-bold");
                  el.props.className = hasBold
                    ? el.props.className.replace("font-bold", "").trim()
                    : `${el.props.className ?? ""} font-bold`.trim();
                })}
              >
                Toggle Bold
              </Button>

              <Input
                type="color"
                className="w-full"
                onChange={(e) => updateNode(node.id, (n) => {
                  const el = n as TreeElementNode;
                  el.props.style = { ...el.props.style, color: e.target.value };
                })}
              />
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-10 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}
    </>
  );
}
