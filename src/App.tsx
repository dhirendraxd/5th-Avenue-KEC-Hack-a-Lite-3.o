import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BrowseEquipment from "./pages/BrowseEquipment";
import EquipmentDetail from "./pages/EquipmentDetail";
import OwnerDashboard from "./pages/OwnerDashboard";
import AddEquipment from "./pages/AddEquipment";
import RentalOperations from "./pages/RentalOperations";
import FinanceDashboard from "./pages/FinanceDashboard";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import MaterialsList from "./pages/MaterialsList";
import MaterialsFind from "./pages/MaterialsFind";

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/browse" element={<BrowseEquipment />} />
        <Route path="/equipment/:id" element={<EquipmentDetail />} />
        <Route path="/dashboard" element={<OwnerDashboard />} />
        <Route path="/dashboard/add-equipment" element={<AddEquipment />} />
        <Route path="/rental/:id" element={<RentalOperations />} />
        <Route path="/finance" element={<FinanceDashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/materials/list" element={<MaterialsList />} />
        <Route path="/materials/find" element={<MaterialsFind />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
