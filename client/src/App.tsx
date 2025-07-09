import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Members from "@/pages/members";
import Attendance from "@/pages/attendance";
import Donations from "@/pages/donations";
import Calendar from "@/pages/calendar";
import About from "@/pages/about";
import Gallery from "@/pages/gallery";
import Forum from "@/pages/forum";
import TopicDetail from "@/pages/topic-detail";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/landing" component={Landing} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/members" component={Members} />
      <ProtectedRoute path="/attendance" component={Attendance} />
      <ProtectedRoute path="/donations" component={Donations} />
      <ProtectedRoute path="/calendar" component={Calendar} />
      <ProtectedRoute path="/forum" component={Forum} />
      <ProtectedRoute path="/topic/:id" component={TopicDetail} />
      <ProtectedRoute path="/about" component={About} />

      <ProtectedRoute path="/gallery" component={Gallery} />
      <ProtectedRoute path="/settings" component={Settings} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
