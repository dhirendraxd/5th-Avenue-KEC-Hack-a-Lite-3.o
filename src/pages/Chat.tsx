import Navbar from "@/components/layout/Navbar";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import ChatPanel from "@/components/chat/ChatPanel";

const Chat = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="marketplace" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Equipment Advisor</h1>
          <p className="text-muted-foreground">
            Describe your project and get AI-powered equipment recommendations
          </p>
        </div>
        <ChatPanel fullPage />
      </main>
    </div>
  );
};

export default Chat;
