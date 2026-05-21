import { Paperclip, Send } from "lucide-react";
import { type KeyboardEvent, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMessagesStore } from "@/store/useMessagesStore";

export function MessageInput() {
  const { sendMessage, activeConversationId } = useMessagesStore();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || !activeConversationId) return;
    setText("");
    textareaRef.current?.focus();
    await sendMessage(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <TooltipProvider>
      <div className="px-4 py-3 border-t border-border bg-background sm:mb-14 sm:py-6">
        <div className="flex items-end gap-2">
          {/* Attach */}
          <div className="shrink-0 pb-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-foreground"
                  aria-label="Attach file"
                >
                  <Paperclip className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Attach image</TooltipContent>
            </Tooltip>
          </div>

          <Textarea
            ref={textareaRef}
            placeholder="Type a message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="min-h-10 max-h-32 resize-none flex-1 bg-muted/60 border-0 rounded-2xl py-2.5 px-4 text-sm focus-visible:ring-1 leading-relaxed"
          />

          <Button
            size="icon"
            className="shrink-0 size-10 rounded-full mb-0.5 transition-all"
            disabled={!text.trim()}
            onClick={handleSend}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground/60 text-center mt-1.5 select-none">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </TooltipProvider>
  );
}
