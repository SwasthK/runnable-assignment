import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function CodeInput({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) {
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
        <div className="flex-1 p-3 overflow-auto">
          <Textarea
            id="code-input"
            placeholder="Type your message here."
            className="h-full w-full resize-none bg-transparent text-sm outline-none"
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