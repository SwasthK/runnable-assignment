import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type PreviewProps = {
  codeInputOpen: boolean;
  setCodeInputOpen: Dispatch<SetStateAction<boolean>>;
  codeEditorOpen: boolean;
  setCodeEditorOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Preview({ codeInputOpen, setCodeInputOpen, codeEditorOpen, setCodeEditorOpen }: PreviewProps) {
  const onPanelClick = (direction: 'left' | 'right') => {
    const isMobile = window.innerWidth < 768
    if (direction === 'left') {
      if (isMobile) setCodeEditorOpen(false)
      setCodeInputOpen((v) => !v)
    } else {
      if (isMobile) setCodeInputOpen(false)
      setCodeEditorOpen((v) => !v)
    }
  }

  return (
    <>
      <div className="flex flex-1 flex-col min-w-0 bg-background">
        <div className="flex h-10 items-center justify-between border-b px-3 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onPanelClick('left')}
              >
                {codeInputOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{`${codeInputOpen ? 'Close' : 'Open'} Code`}</p>
            </TooltipContent>
          </Tooltip>
          <span className="text-sm font-medium">Preview</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onPanelClick('right')}
              >
                {codeEditorOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{`${codeEditorOpen ? 'Close' : 'Open'} Editor`}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <p className="text-sm text-muted-foreground">Preview content goes here.</p>
        </div>
      </div>
    </>
  )
}
