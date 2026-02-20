import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import BrowseEquipment from "./pages/BrowseEquipment";
import EquipmentDetail from "./pages/EquipmentDetail";
import OwnerDashboard from "./pages/OwnerDashboard";
import RentalOperations from "./pages/RentalOperations";
import FinanceDashboard from "./pages/FinanceDashboard";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import ChatBubble from "./components/chat/ChatBubble";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/browse" element={<BrowseEquipment />} />
              <Route path="/equipment/:id" element={<EquipmentDetail />} />
              <Route path="/dashboard" element={<OwnerDashboard />} />
              <Route path="/rental/:id" element={<RentalOperations />} />
              <Route path="/finance" element={<FinanceDashboard />} />
              <Route path="/chat" element={<Chat />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatBubble />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
