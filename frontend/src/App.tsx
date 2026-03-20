import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TripProvider } from "@/context/TripContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TripDetail from "./pages/TripDetail";
import PlaceDetail from "./pages/PlaceDetail";
import SharedTrip from "./pages/SharedTrip";
import NotFound from "./pages/NotFound";

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
            <Route path="/app" element={<MobileFrame><Dashboard /></MobileFrame>} />
            <Route path="/app/trip/:id" element={<FullFrame><TripDetail /></FullFrame>} />
            <Route path="/app/trip/:id/place/:placeId" element={<FullFrame><PlaceDetail /></FullFrame>} />
            <Route path="/share/:token" element={<MobileFrame><SharedTrip /></MobileFrame>} />
            <Route path="*" element={<MobileFrame><NotFound /></MobileFrame>} />
          </Routes>
        </BrowserRouter>
      </TripProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
