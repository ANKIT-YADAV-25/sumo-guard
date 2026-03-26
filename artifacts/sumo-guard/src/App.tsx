import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/auth";

import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/dashboard";
import SleepLogs from "@/pages/sleep";
import HabitLogs from "@/pages/habits";
import Predictions from "@/pages/predictions";
import Profile from "@/pages/profile";
import Statistics from "@/pages/statistics";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Onboarding from "@/pages/onboarding";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRouter() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080d14" }}>
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"
          style={{ boxShadow: "0 0 20px rgba(245,158,11,0.3)" }} />
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route>
          <Login />
        </Route>
      </Switch>
    );
  }

  if (!user.onboardingDone) {
    return (
      <Switch>
        <Route path="/onboarding" component={Onboarding} />
        <Route component={Onboarding} />
      </Switch>
    );
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/sleep" component={SleepLogs} />
        <Route path="/habits" component={HabitLogs} />
        <Route path="/predictions" component={Predictions} />
        <Route path="/statistics" component={Statistics} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <ProtectedRouter />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
