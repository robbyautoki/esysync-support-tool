import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SupportPage from "@/pages/support";
import AdminPage from "@/pages/admin";
import TrackStatus from "@/pages/track-status";
import ArchivePage from "@/pages/archive";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SupportPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/archive" component={ArchivePage} />
      <Route path="/track/:rmaNumber?" component={TrackStatus} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
