import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import FormBuilder from "@/pages/form-builder";
import PublicForm from "@/pages/public-form";
import Responses from "@/pages/responses";
import Statistics from "@/pages/statistics";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/statistics" component={Statistics} />
      <ProtectedRoute path="/forms/new" component={FormBuilder} />
      <ProtectedRoute path="/forms/:id/edit" component={FormBuilder} />
      <ProtectedRoute path="/forms/:id/responses" component={Responses} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/f/:id" component={PublicForm} />
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
