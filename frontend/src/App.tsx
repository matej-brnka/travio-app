import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TripProvider } from "@/context/TripContext";
import { AuthGuard } from "@/components/AuthGuard";
import { AdminGuard } from "@/components/AdminGuard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TripDetail from "./pages/TripDetail";
import PlaceDetail from "./pages/PlaceDetail";
import SharedTrip from "./pages/SharedTrip";
import NotFound from "./pages/NotFound";
import OpenAiService from "./pages/OpenAiService";
import GooglePlacesService from "./pages/GooglePlacesService";
import CostDashboard from "./pages/CostDashboard";
import InvitesService from "./pages/InvitesService";

const queryClient = new QueryClient();

// Pages that use mobile-centric layout (centered, narrow)
const MobileFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-[480px] mx-auto min-h-screen">{children}</div>
);

// Pages that go full-width on desktop
const FullFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen">{children}</div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <TripProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<FullFrame><Landing /></FullFrame>} />
            <Route path="/login" element={<MobileFrame><Login /></MobileFrame>} />
            <Route path="/app" element={<MobileFrame><AuthGuard><Dashboard /></AuthGuard></MobileFrame>} />
            <Route path="/app/service/openai" element={<FullFrame><AuthGuard><AdminGuard><OpenAiService /></AdminGuard></AuthGuard></FullFrame>} />
            <Route path="/app/service/google-places" element={<FullFrame><AuthGuard><AdminGuard><GooglePlacesService /></AdminGuard></AuthGuard></FullFrame>} />
            <Route path="/app/service/costs" element={<FullFrame><AuthGuard><AdminGuard><CostDashboard /></AdminGuard></AuthGuard></FullFrame>} />
            <Route path="/app/service/invites" element={<FullFrame><AuthGuard><AdminGuard><InvitesService /></AdminGuard></AuthGuard></FullFrame>} />
            <Route path="/app/trip/:id" element={<FullFrame><AuthGuard><TripDetail /></AuthGuard></FullFrame>} />
            <Route path="/app/trip/:id/place/:placeId" element={<FullFrame><AuthGuard><PlaceDetail /></AuthGuard></FullFrame>} />
            <Route path="/share/:token" element={<FullFrame><SharedTrip /></FullFrame>} />
            <Route path="*" element={<MobileFrame><NotFound /></MobileFrame>} />
          </Routes>
        </BrowserRouter>
      </TripProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
