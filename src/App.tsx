import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
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
import SplashScreen from "@/components/ui/SplashScreen";

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

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <SplashScreen />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full w-full"
        >
          {!user ? (
            <Switch>
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route>
                <Login />
              </Route>
            </Switch>
          ) : !user.onboardingDone ? (
            <Switch>
              <Route path="/onboarding" component={Onboarding} />
              <Route component={Onboarding} />
            </Switch>
          ) : (
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
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
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
