import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import DefaultSeo from "@/components/seo/DefaultSeo";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GlobalTermsGate from "@/components/auth/GlobalTermsGate";

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
const Platform = lazy(() => import("./pages/Platform"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Contact = lazy(() => import("./pages/Contact"));
const Careers = lazy(() => import("./pages/Careers"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const InsuranceCoverage = lazy(() => import("./pages/InsuranceCoverage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MaterialsList = lazy(() => import("./pages/MaterialsList"));
const MaterialsFind = lazy(() => import("./pages/MaterialsFind"));
const VerifyPickup = lazy(() => import("./pages/VerifyPickup"));

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <DefaultSeo />
      <GlobalTermsGate />
      <Suspense
        fallback={
          <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
              <Skeleton className="h-10 w-40 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
                <Skeleton className="h-64 rounded-lg" />
              </div>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/browse" element={<BrowseEquipment />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/insurance" element={<InsuranceCoverage />} />
          <Route path="/equipment/:id" element={<EquipmentDetail />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/add-equipment"
            element={
              <ProtectedRoute>
                <AddEquipment />
              </ProtectedRoute>
            }
          />
          <Route path="/rental/:id" element={<RentalOperations />} />
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/analytics" element={<UserAnalytics />} />
          <Route path="/chat" element={<Chat />} />
          <Route
            path="/materials/list"
            element={
              <ProtectedRoute>
                <MaterialsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/find"
            element={
              <ProtectedRoute>
                <MaterialsFind />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials/verify"
            element={
              <ProtectedRoute>
                <VerifyPickup />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
