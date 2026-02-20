import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatPanel from "./ChatPanel";

const ChatBubble = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 animate-fade-in">
          <ChatPanel onClose={() => setOpen(false)} />
        </div>
      )}
      <Button
        onClick={() => setOpen(!open)}
        size="lg"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <MessageCircle className={`h-6 w-6 transition-transform ${open ? "rotate-90" : ""}`} />
      </Button>
    </div>
  );
};

export default ChatBubble;
