import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, X, Wrench, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { streamChat, type ChatMessage } from "@/lib/chatStream";
import { useToast } from "@/hooks/use-toast";
import EquipmentMiniCard from "./EquipmentMiniCard";

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "👋 Hi! I'm GearShift's equipment advisor. Tell me about your project or task, and I'll recommend the right equipment for you.\n\nFor example:\n- *\"I need to dig a foundation for a 2-story house\"*\n- *\"We're organizing a 500-person outdoor concert\"*\n- *\"My warehouse floor needs deep cleaning\"*",
};

const EQUIP_TAG_REGEX = /\[EQUIP:(e\d+)\]/g;

const ChatMessageContent = ({ content }: { content: string }) => {
  const parts = useMemo(() => {
    const result: { type: "text" | "equip"; value: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(EQUIP_TAG_REGEX);

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        result.push({ type: "text", value: content.slice(lastIndex, match.index) });
      }
      result.push({ type: "equip", value: match[1] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) {
      result.push({ type: "text", value: content.slice(lastIndex) });
    }
    return result;
  }, [content]);

  return (
    <div>
      {parts.map((part, i) =>
        part.type === "equip" ? (
          <EquipmentMiniCard key={i} equipmentId={part.value} />
        ) : (
          <div key={i} className="prose prose-sm max-w-none dark:prose-invert [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
            <ReactMarkdown>{part.value}</ReactMarkdown>
          </div>
        )
      )}
    </div>
  );
};

interface ChatPanelProps {
  onClose?: () => void;
  fullPage?: boolean;
}

const ChatPanel = ({ onClose, fullPage = false }: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last !== WELCOME_MESSAGE) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: messages.filter((m) => m !== WELCOME_MESSAGE).concat(userMsg),
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          toast({ title: "Chat Error", description: err, variant: "destructive" });
          setIsLoading(false);
        },
      });
    } catch {
      toast({ title: "Connection Error", description: "Could not reach the assistant.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const containerClass = fullPage
    ? "flex flex-col h-[calc(100vh-5rem)] max-w-3xl mx-auto"
    : "flex flex-col h-[500px] w-full max-w-[380px]";

  return (
    <Card className={`${containerClass} overflow-hidden border border-border shadow-xl`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Equipment Advisor</h3>
            <p className="text-xs text-muted-foreground">AI-powered recommendations</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ChatMessageContent content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-muted px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your project or need..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatPanel;
