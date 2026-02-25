"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Sparkles,
  User,
  Bot,
  HelpCircle,
  FileText,
  CheckSquare,
  Quote,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PrdChatProps {
  prdId: string;
}

const QUICK_ACTIONS = [
  {
    label: "Open questions",
    icon: HelpCircle,
    prompt: "What open questions should we answer to make this PRD ready? List them clearly.",
  },
  {
    label: "User stories",
    icon: FileText,
    prompt:
      'Draft user stories for this PRD. Use the format "As a [role], I want to [action], so that [benefit]".',
  },
  {
    label: "Acceptance criteria",
    icon: CheckSquare,
    prompt:
      "Draft acceptance criteria for this PRD. Use Given/When/Then format where appropriate.",
  },
  {
    label: "Summarize evidence",
    icon: Quote,
    prompt:
      "Summarize the evidence and problem statement for this PRD. Highlight any gaps or assumptions.",
  },
];

function getTextContent(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts) return "";
  return message.parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text)
    .join("");
}

export function PrdChat({ prdId }: PrdChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { prdId } }),
    [prdId]
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleQuickAction(prompt: string) {
    sendMessage({ text: prompt });
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex h-full flex-col rounded-lg border">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Sparkles className="h-4 w-4" />
        <h3 className="text-sm font-semibold">PRD Assistant</h3>
        {isLoading && (
          <Badge variant="outline" className="ml-auto text-xs">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Thinking...
          </Badge>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Ask me to help write sections, identify gaps, or draft content.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="h-auto py-2 px-3 text-xs justify-start"
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={isLoading}
                >
                  <action.icon className="mr-2 h-3 w-3 shrink-0" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const text = getTextContent(message);
              if (!text) return null;
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : ""
                  )}
                >
                  {message.role !== "user" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="h-3 w-3" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">
                      {text}
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="rounded-lg bg-muted px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Quick actions bar (shown when there are messages) */}
      {messages.length > 0 && (
        <div className="flex gap-1 border-t px-3 py-2 overflow-x-auto">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={() => handleQuickAction(action.prompt)}
              disabled={isLoading}
            >
              <action.icon className="mr-1 h-3 w-3" />
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t p-3"
      >
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this PRD..."
          className="min-h-[40px] max-h-[120px] resize-none text-sm"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !input.trim()}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
