import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Glossary from "./pages/Glossary";
import Research from "./pages/Research";
import Banking from "./pages/sectors/Banking";
import Trade from "./pages/sectors/Trade";
import Poverty from "./pages/sectors/Poverty";
import DataRepository from "./pages/DataRepository";
import AdminPortal from "./pages/AdminPortal";
import PartnerPortal from "./pages/PartnerPortal";
import AIAssistant from "./pages/AIAssistant";
import ScenarioSimulator from "./pages/ScenarioSimulator";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/about"} component={About} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/glossary"} component={Glossary} />
      <Route path={"/research"} component={Research} />
      <Route path={"/sectors/banking"} component={Banking} />
      <Route path={"/sectors/trade"} component={Trade} />
      <Route path={"/sectors/poverty"} component={Poverty} />
      <Route path={"/data-repository"} component={DataRepository} />
      <Route path={"/admin"} component={AdminPortal} />
      <Route path={"/partner"} component={PartnerPortal} />
      <Route path={"/ai-assistant"} component={AIAssistant} />
      <Route path={"/scenario-simulator"} component={ScenarioSimulator} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
      </main>
      <Footer />
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
