"use client"

import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { useEditor } from "@/store/editor";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { findNode } from "@/lib/tree-utils";
import { TreeElementNode } from "@/types";
import { FONT_SIZES, FONT_WEIGHTS } from "@/constants";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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
              <div className="space-y-2">
                <Label className="tracking-wide">Typography</Label>
                <div className="flex gap-2 items-center w-full">
                  <div className="flex gap-1 flex-col w-full">
                    <Label htmlFor="font-size" className="text-xs text-muted-foreground tracking-wide">Font Size</Label>
                    <Select
                      onValueChange={(value) => updateNode(node.id, (n) => {
                        const el = n as TreeElementNode;
                        el.props.className = updateClass(el.props.className, "text-", value);
                      })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Font Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {FONT_SIZES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                  </div>
                  <div className="flex gap-1 flex-col w-full">
                    <Label htmlFor="font-weight" className="text-xs text-muted-foreground tracking-wide">Font Weight</Label>
                    <Select onValueChange={(value) => updateNode(node.id, (n) => {
                      const el = n as TreeElementNode;
                      el.props.className = updateClass(el.props.className, "font-", value);
                    })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Font Weight" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {FONT_WEIGHTS.map((w) => (
                            <SelectItem key={w} value={w}>{w}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="">
                  <div className="flex gap-1 flex-col">
                    <Label htmlFor="font-color" className="text-xs text-muted-foreground tracking-wide">Font Color</Label>
                    <Input
                      id="font-color"
                      type="color"
                      className="h-8 w-8 cursor-pointer p-0.5 border-md"
                      onChange={(e) => updateNode(node.id, (n) => {
                        const el = n as TreeElementNode;
                        el.props.style = { ...el.props.style, color: e.target.value };
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Background</Label>
                <div className="flex gap-1 flex-col">
                  <Label htmlFor="bg-color" className="text-xs text-muted-foreground tracking-wide">Color</Label>
                  <Input
                    id="bg-color"
                    type="color"
                    className="h-8 w-8 cursor-pointer p-0.5"
                    onChange={(e) => updateNode(node.id, (n) => {
                      const el = n as TreeElementNode;
                      el.props.style = { ...el.props.style, backgroundColor: e.target.value };
                    })}
                  />
                </div>
              </div>
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
