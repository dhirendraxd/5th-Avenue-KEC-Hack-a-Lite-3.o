import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const BrowseEquipment = lazy(() => import("./pages/BrowseEquipment"));
const EquipmentDetail = lazy(() => import("./pages/EquipmentDetail"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const AddEquipment = lazy(() => import("./pages/AddEquipment"));
const RentalOperations = lazy(() => import("./pages/RentalOperations"));
const FinanceDashboard = lazy(() => import("./pages/FinanceDashboard"));
const UserAnalytics = lazy(() => import("./pages/UserAnalytics"));
const Chat = lazy(() => import("./pages/Chat"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MaterialsList = lazy(() => import("./pages/MaterialsList"));
const MaterialsFind = lazy(() => import("./pages/MaterialsFind"));
const VerifyPickup = lazy(() => import("./pages/VerifyPickup"));

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/browse" element={<BrowseEquipment />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route path="/dashboard" element={<OwnerDashboard />} />
          <Route path="/dashboard/add-equipment" element={<AddEquipment />} />
          <Route path="/rental/:id" element={<RentalOperations />} />
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/analytics" element={<UserAnalytics />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/materials/list" element={<MaterialsList />} />
          <Route path="/materials/find" element={<MaterialsFind />} />
          <Route path="/materials/verify" element={<VerifyPickup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
