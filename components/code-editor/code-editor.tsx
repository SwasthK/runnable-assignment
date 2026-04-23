import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";

export default function CodeEditor({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
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
        <div className="flex-1 p-3 overflow-auto">
          <textarea
            className="h-full w-full resize-none bg-transparent font-mono text-sm outline-none"
            placeholder="Write your code here..."
          />
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