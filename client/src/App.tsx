import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import ExtensionPopup from "@/pages/ExtensionPopup";

interface AppProps {
  isExtensionContext?: boolean;
}

function Router({ isExtensionContext }: AppProps) {
  // If we're in a Chrome extension context, directly render the popup
  if (isExtensionContext) {
    return <ExtensionPopup />;
  }

  // Otherwise use routing (for dev/preview purposes)
  return (
    <Switch>
      <Route path="/" component={ExtensionPopup} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App({ isExtensionContext = false }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Router isExtensionContext={isExtensionContext} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
