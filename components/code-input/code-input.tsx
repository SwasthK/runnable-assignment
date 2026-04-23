"use client"

import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction, useState } from "react";
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { parseJSX } from "@/lib/parse-jsx";
import { astToTree } from "@/lib/ast-to-tree";
import { useEditor } from "@/store/editor";

export default function CodeInput({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
  const [input, setInput] = useState('<div className="text-xl text-muted">Hello World</div>')
  const { setTree } = useEditor();

  const handleLoad = () => {
    const ast = parseJSX(input);
    const tree = astToTree(ast);
    setTree(tree)
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-col border-r bg-background transition-all duration-300 overflow-hidden z-20",
          "fixed inset-y-0 left-0 md:relative md:inset-auto",
          open ? "w-80" : "w-0"
        )}
      >
        <div className="flex h-10 items-center border-b px-3 shrink-0">
          <Label htmlFor="code-input">Input</Label>
        </div>
        <div className="flex flex-col flex-1 gap-2 p-3 overflow-auto">
          <Textarea
            id="code-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here."
            className="flex-1 resize-none bg-transparent text-sm outline-none"
          />
          <Button onClick={handleLoad} className="w-full shrink-0">Load Component</Button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-10 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
