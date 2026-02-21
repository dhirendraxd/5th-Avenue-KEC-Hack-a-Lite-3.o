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

/**
 * Initial welcome message displayed when chat opens
 * Provides context about what the assistant can do and example queries
 */
const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Welcome to Upayog. I'm your equipment advisor. Share your project requirements and I will recommend suitable equipment options.\n\nExamples:\n- *\"I need to dig a foundation for a 2-story house\"*\n- *\"We are organizing a 500-person outdoor event\"*\n- *\"My warehouse floor needs deep cleaning\"*",
};

/**
 * Regex pattern to detect equipment tags in assistant messages
 * Format: [EQUIP:e123] where e123 is the equipment ID
 * Used to replace text tags with interactive equipment cards
 */
const EQUIP_TAG_REGEX = /\[EQUIP:(e\d+)\]/g;

/**
 * Component that parses and renders chat message content
 * Handles both plain text (rendered as Markdown) and equipment tags
 * Equipment tags [EQUIP:eXXX] are replaced with interactive equipment cards
 */
const ChatMessageContent = ({ content }: { content: string }) => {
  /**
   * Parse message content to separate text and equipment references
   * Memoized to avoid re-parsing on every render
   * 
   * Logic:
   * 1. Use regex to find all [EQUIP:eXXX] tags in the message
   * 2. Split content into alternating text and equipment sections
   * 3. Return array of parts with types for conditional rendering
   */
  const parts = useMemo(() => {
    const result: { type: "text" | "equip"; value: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(EQUIP_TAG_REGEX);

    // Find all equipment tags in the message
    while ((match = regex.exec(content)) !== null) {
      // Add text before the equipment tag
      if (match.index > lastIndex) {
        result.push({ type: "text", value: content.slice(lastIndex, match.index) });
      }
      // Add equipment reference (match[1] is the equipment ID)
      result.push({ type: "equip", value: match[1] });
      lastIndex = regex.lastIndex;
    }
    // Add remaining text after last equipment tag
    if (lastIndex < content.length) {
      result.push({ type: "text", value: content.slice(lastIndex) });
    }
    return result;
  }, [content]);

  /**
   * Render each part based on type:
   * - Equipment tags -> Interactive equipment mini cards
   * - Text content -> Markdown-formatted text
   */
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
  // Message history state - initialized with welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  
  // Current user input state
  const [input, setInput] = useState("");
  
  // Loading state to prevent multiple simultaneous requests
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for auto-scrolling to latest message
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Ref for input field focus management
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  /**
   * Auto-scroll to bottom when new messages arrive
   * Ensures latest message is always visible
   */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Handle sending a user message and receiving streaming assistant response
   * 
   * Flow:
   * 1. Validate input and check if not already loading
   * 2. Add user message to chat history
   * 3. Clear input field and set loading state
   * 4. Stream assistant response chunk by chunk
   * 5. Update assistant message in real-time as chunks arrive
   * 6. Handle errors with toast notifications
   */
  const send = async () => {
    const text = input.trim();
    // Prevent sending empty messages or multiple simultaneous requests
    if (!text || isLoading) return;

    // Add user message to chat
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Track accumulated assistant response for streaming updates
    let assistantSoFar = "";
    
    /**
     * Callback to update assistant message as new chunks arrive
     * Either updates existing assistant message or creates a new one
     */
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        // If last message is assistant (not welcome), update it
        if (last?.role === "assistant" && last !== WELCOME_MESSAGE) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        // Otherwise, add new assistant message
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    /**
     * Call streaming chat API
     * - Filter out welcome message from history (not sent to API)
     * - Include full conversation history for context
     * - Handle streaming chunks, completion, and errors
     */
    try {
      await streamChat({
        messages: messages.filter((m) => m !== WELCOME_MESSAGE).concat(userMsg),
        onDelta: upsertAssistant,  // Handle each chunk as it arrives
        onDone: () => setIsLoading(false),  // Reset loading state when complete
        onError: (err) => {
          toast({ title: "Chat Error", description: err, variant: "destructive" });
          setIsLoading(false);
        },
      });
    } catch {
      // Network or connection errors
      toast({ title: "Connection Error", description: "Could not reach the assistant.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  /**
   * Dynamic container styling based on display mode
   * fullPage: Full height page layout (for /chat route)
   * sidebar: Compact panel (for floating chat button)
   */
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

      {/* Messages Area - Scrollable chat history */}
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-4">
          {/* Render all messages with role-based styling */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"  // User messages: primary color
                    : "bg-muted text-foreground"  // Assistant messages: muted background
                }`}
              >
                {/* Assistant messages support Markdown and equipment cards */}
                {msg.role === "assistant" ? (
                  <ChatMessageContent content={msg.content} />
                ) : (
                  msg.content  // User messages render as plain text
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator - shown while waiting for assistant response */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-muted px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          
          {/* Scroll anchor - ensures auto-scroll to latest message */}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area - Message composition and send */}
      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          {/* Text input for user message */}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your project or need..."
            disabled={isLoading}  // Disable during API call
            className="flex-1"
          />
          
          {/* Send button - disabled if input empty or loading */}
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatPanel;
