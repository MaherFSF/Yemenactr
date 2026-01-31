import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Splash from "./pages/Splash";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Glossary from "./pages/Glossary";
import Research from "./pages/Research";
import Banking from "./pages/sectors/Banking";
import Trade from "./pages/sectors/Trade";
import Poverty from "./pages/sectors/Poverty";
import Macroeconomy from "./pages/sectors/Macroeconomy";
import Prices from "./pages/sectors/Prices";
import Currency from "./pages/sectors/Currency";
import PublicFinance from "./pages/sectors/PublicFinance";
import Energy from "./pages/sectors/Energy";
import FoodSecurity from "./pages/sectors/FoodSecurity";
import AidFlows from "./pages/sectors/AidFlows";
import LaborMarket from "./pages/sectors/LaborMarket";
import ConflictEconomy from "./pages/sectors/ConflictEconomy";
import Infrastructure from "./pages/sectors/Infrastructure";
import Agriculture from "./pages/sectors/Agriculture";
import Investment from "./pages/sectors/Investment";
import Microfinance from "./pages/sectors/Microfinance";
import DataRepository from "./pages/DataRepository";
import AdminPortal from "./pages/AdminPortal";
import PartnerPortal from "./pages/PartnerPortal";
import AIAssistant from "./pages/AIAssistantEnhanced";
import ScenarioSimulator from "./pages/ScenarioSimulator";
import Timeline from "./pages/Timeline";
import Methodology from "./pages/Methodology";
import ReportBuilder from "./pages/ReportBuilder";
import Pricing from "./pages/Pricing";
import Legal from "./pages/Legal";
import DataPolicy from "./pages/DataPolicy";
import Entities from "./pages/Entities";
import EntityDetail from "./pages/EntityDetail";
import BankDetail from "./pages/entities/BankDetail";
import Corrections from "./pages/Corrections";
import Publications from "./pages/Publications";
import CoverageScorecard from "./pages/CoverageScorecard";
import Compliance from "./pages/Compliance";
import UserDashboard from "./pages/UserDashboard";
import Changelog from "./pages/Changelog";
import APIKeys from "./pages/APIKeys";
import NotificationSettings from "./pages/NotificationSettings";
import ComparisonTool from "./pages/ComparisonTool";
import IndicatorCatalog from "./pages/IndicatorCatalog";
import AdminMonitoring from "./pages/AdminMonitoring";
import DataFreshness from "./pages/DataFreshness";
import ApiDocs from "./pages/ApiDocs";
import PolicyImpact from "./pages/PolicyImpact";
import DataExchangeHub from "./pages/DataExchangeHub";
import AccuracyDashboard from "./pages/AccuracyDashboard";
import SchedulerStatus from "./pages/SchedulerStatus";
import IngestionDashboard from "./pages/IngestionDashboard";
import AdvancedSearch from "./pages/AdvancedSearch";
import SchedulerDashboard from "./pages/SchedulerDashboard";
import AlertsDashboard from "./pages/AlertsDashboard";
import ResearchPortal from "./pages/ResearchPortal";
import ResearchExplorer from "./pages/ResearchExplorer";
import ResearchVisualization from "./pages/ResearchVisualization";
import ResearchAssistant from "./pages/ResearchAssistant";
import ResearchLibrary from "./pages/ResearchLibrary";
import ResearchAudit from "./pages/ResearchAudit";
import Sanctions from "./pages/Sanctions";
import CorporateRegistry from "./pages/CorporateRegistry";
import Remittances from "./pages/Remittances";
import PublicDebt from "./pages/PublicDebt";
import HumanitarianFunding from "./pages/HumanitarianFunding";
import RegionalZones from "./pages/RegionalZones";
import EconomicActors from "./pages/EconomicActors";
import HSAGroupProfile from "./pages/HSAGroupProfile";
import ApiHealthDashboard from "./pages/admin/ApiHealthDashboard";
import AlertHistory from "./pages/admin/AlertHistory";
import AdminHub from "./pages/admin/AdminHub";
import WebhookSettings from "./pages/admin/WebhookSettings";
import ConnectorThresholds from "./pages/admin/ConnectorThresholds";
import AutopilotControlRoom from "./pages/admin/AutopilotControlRoom";
import ReportWorkflow from "./pages/admin/ReportWorkflow";
import VisualizationBuilder from "./pages/admin/VisualizationBuilder";
import InsightMiner from "./pages/admin/InsightMiner";
import ExportBundle from "./pages/admin/ExportBundle";
import CoverageMap from "./pages/admin/CoverageMap";
import BackfillDashboard from "./pages/admin/BackfillDashboardPage";
import ApiKeysPage from "./pages/admin/ApiKeysPage";
import ReleaseGate from "./pages/admin/ReleaseGate";
import ReportsDashboard from "./pages/admin/ReportsDashboard";
import Sitemap from "./pages/Sitemap";
import Reports from "./pages/Reports";
import SourceDetail from "./pages/SourceDetail";
import AllPages from "./pages/review/AllPages";
import { ReviewModeBanner } from "./components/ReviewModeBanner";
import GovernorDashboard from "./pages/GovernorDashboard";
import DeputyGovernorDashboard from "./pages/DeputyGovernorDashboard";
import FXDashboard from "./pages/dashboards/FXDashboard";
import RoleLensCockpit from "./pages/RoleLensCockpit";
import DecisionJournal from "./pages/DecisionJournal";
import AutoBriefs from "./pages/AutoBriefs";
import SectorsHub from "./pages/SectorsHub";
import SectorPage from "./pages/SectorPage";
import SectorsManagement from "./pages/admin/SectorsManagement";
import MethodologyManagement from "./pages/admin/MethodologyManagement";
import PublishingCommandCenter from "./pages/admin/PublishingCommandCenter";
import PublicationsHub from "./pages/PublicationsHub";
import MissionControl from "./pages/admin/MissionControl";
import PartnerManagement from "./pages/admin/PartnerManagement";
import PartnerDashboard from "./pages/PartnerDashboard";
import ContributorPortal from "./pages/ContributorPortal";
import SultaniCommandCenter from "./pages/admin/SultaniCommandCenter";
import HomepageCMS from "./pages/admin/HomepageCMS";
import UpdatesReviewQueue from "./pages/admin/UpdatesReviewQueue";
import LibraryConsole from "./pages/admin/LibraryConsole";
import GraphConsole from "./pages/admin/GraphConsole";
import SourceConsole from "./pages/admin/SourceConsole";
import RoleAwareEntryPoints from "./components/RoleAwareEntryPoints";
import Updates from "./pages/Updates";
import UpdateDetail from "./pages/UpdateDetail";
import ResearchHub from "./pages/ResearchHub";
import DocumentDetail from "./pages/DocumentDetail";

// Main app router with header/footer
function MainRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
    <Switch>
      <Route path={"/home"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/about"} component={About} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/glossary"} component={Glossary} />
      <Route path={"/research"} component={Research} />
      <Route path={"/search"} component={AdvancedSearch} />
      <Route path={"/research-portal"} component={ResearchPortal} />
      <Route path={"/research-explorer"} component={ResearchExplorer} />
      <Route path={"/research-analytics"} component={ResearchVisualization} />
      <Route path={"/research-assistant"} component={ResearchAssistant} />
      <Route path={"/research-library"} component={ResearchLibrary} />
      <Route path="/research-audit" component={ResearchAudit} />
      <Route path="/research-hub" component={ResearchHub} />
      <Route path="/research/:docId" component={DocumentDetail} />
      <Route path="/sectors" component={SectorsHub} />
      <Route path={"/sectors/banking"} component={Banking} />
      <Route path={"/sectors/trade"} component={Trade} />
      <Route path={"/sectors/poverty"} component={Poverty} />
      <Route path={"/sectors/macroeconomy"} component={Macroeconomy} />
      <Route path={"/sectors/prices"} component={Prices} />
      <Route path={"/sectors/currency"} component={Currency} />
      <Route path={"/sectors/public-finance"} component={PublicFinance} />
      <Route path={"/sectors/energy"} component={Energy} />
      <Route path={"/sectors/food-security"} component={FoodSecurity} />
      <Route path={"/sectors/aid-flows"} component={AidFlows} />
      <Route path={"/sectors/labor-market"} component={LaborMarket} />
      <Route path={"/sectors/conflict-economy"} component={ConflictEconomy} />
      <Route path={"/sectors/infrastructure"} component={Infrastructure} />
      <Route path={"/sectors/agriculture"} component={Agriculture} />
      <Route path={"/sectors/investment"} component={Investment} />
      <Route path={"/sectors/microfinance"} component={Microfinance} />
      <Route path="/sectors/:sectorCode" component={SectorPage} />
      <Route path={"/data-repository"} component={DataRepository} />
      <Route path={"/data/repository"} component={DataRepository} />
      <Route path={"/timeline"} component={Timeline} />
      <Route path={"/methodology"} component={Methodology} />
      <Route path="/source/:sourceId" component={SourceDetail} />
      <Route path={"/report-builder"} component={ReportBuilder} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path="/subscriptions">{() => { window.location.href = '/pricing'; return null; }}</Route>
      <Route path="/data-policy" component={DataPolicy} />
      <Route path={"/legal"} component={Legal} />
      <Route path={"/entities"} component={Entities} />
      <Route path="/company/hsa-group" component={HSAGroupProfile} />
      <Route path={"/entities/:id"} component={EntityDetail} />
      <Route path={"/entities/bank/:id"} component={BankDetail} />
      <Route path={"/corrections"} component={Corrections} />
      <Route path={"/publications"} component={Publications} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/coverage"} component={CoverageScorecard} />
      <Route path={"/compliance"} component={Compliance} />
      <Route path={"/my-dashboard"} component={UserDashboard} />
      <Route path={"/dashboards/fx"} component={FXDashboard} />
      <Route path={"/changelog"} component={Changelog} />
      <Route path={"/api-keys"} component={APIKeys} />
      <Route path={"/notifications"} component={NotificationSettings} />
      <Route path={"/legal/privacy"} component={Legal} />
      <Route path={"/legal/terms"} component={Legal} />
      <Route path={"/legal/data-license"} component={Legal} />
      <Route path={"/legal/accessibility"} component={Legal} />
      <Route path={"/admin"} component={AdminPortal} />
      <Route path={"/admin/monitoring"} component={AdminMonitoring} />
      <Route path="/data-freshness" component={DataFreshness} />
      <Route path="/api-docs" component={ApiDocs} />
      <Route path="/policy-impact" component={PolicyImpact} />
      <Route path="/data-exchange" component={DataExchangeHub} />
      <Route path="/accuracy" component={AccuracyDashboard} />
      <Route path="/admin/scheduler" component={SchedulerDashboard} />
      <Route path="/admin/scheduler-status" component={SchedulerStatus} />
      <Route path="/admin/ingestion" component={IngestionDashboard} />
          <Route path="/admin/alerts" component={AlertsDashboard} />
          <Route path="/admin/api-health" component={ApiHealthDashboard} />
          <Route path="/admin/alert-history" component={AlertHistory} />
          <Route path="/admin-hub" component={AdminHub} />
          <Route path="/admin/webhooks" component={WebhookSettings} />
          <Route path="/admin/connector-thresholds" component={ConnectorThresholds} />
          <Route path="/admin/autopilot" component={AutopilotControlRoom} />
          <Route path="/admin/coverage-map" component={CoverageMap} />
          <Route path="/admin/backfill" component={BackfillDashboard} />
        <Route path="/admin/api-keys" component={ApiKeysPage} />
        <Route path="/admin/release-gate" component={ReleaseGate} />
          <Route path="/admin/reports" component={ReportWorkflow} />
          <Route path="/admin/reports-dashboard" component={ReportsDashboard} />
          <Route path="/admin/visualizations" component={VisualizationBuilder} />
          <Route path="/admin/insights" component={InsightMiner} />
          <Route path="/admin/export" component={ExportBundle} />
          <Route path="/admin/sectors" component={SectorsManagement} />
          <Route path="/admin/methodology" component={MethodologyManagement} />
          <Route path="/admin/publishing" component={PublishingCommandCenter} />
          <Route path="/admin/mission-control" component={MissionControl} />
          <Route path="/admin/partners" component={PartnerManagement} />
          <Route path="/admin/sultani" component={SultaniCommandCenter} />
          <Route path="/admin/homepage" component={HomepageCMS} />
          <Route path="/admin/updates" component={UpdatesReviewQueue} />
          <Route path="/admin/library" component={LibraryConsole} />
          <Route path="/admin/graph" component={GraphConsole} />
          <Route path="/admin/sources" component={SourceConsole} />
      <Route path="/updates" component={Updates} />
      <Route path="/updates/:id" component={UpdateDetail} />
      <Route path="/publications-hub" component={PublicationsHub} />
      <Route path="/partner-dashboard" component={PartnerDashboard} />
      <Route path="/contribute" component={ContributorPortal} />
      <Route path="/executive/governor" component={GovernorDashboard} />
      <Route path="/executive/deputy-governor" component={DeputyGovernorDashboard} />
      {/* VIP Cockpit Routes */}
      <Route path="/vip/cockpit" component={RoleLensCockpit} />
      <Route path="/vip/decisions" component={DecisionJournal} />
      <Route path="/vip/briefs" component={AutoBriefs} />
      <Route path={"/partner"} component={PartnerPortal} />
      <Route path={"/ai-assistant"} component={AIAssistant} />
      <Route path={"/scenario-simulator"} component={ScenarioSimulator} />
      <Route path={"/comparison"} component={ComparisonTool} />
      <Route path={"/indicators"} component={IndicatorCatalog} />
      <Route path="/sanctions" component={Sanctions} />
      <Route path="/corporate-registry" component={CorporateRegistry} />
      <Route path="/remittances" component={Remittances} />
      <Route path="/public-debt" component={PublicDebt} />
      <Route path="/humanitarian-funding" component={HumanitarianFunding} />
      <Route path="/regional-zones" component={RegionalZones} />
      <Route path="/economic-actors" component={EconomicActors} />
      <Route path="/sitemap" component={Sitemap} />
      <Route path="/review/all-pages" component={AllPages} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
      </main>
      <Footer />
    </div>
  );
}

// Root router that handles splash vs main app
function Router() {
  const [location, setLocation] = useLocation();
  
  // Check splash state synchronously from localStorage
  const splashSeen = typeof window !== 'undefined' ? localStorage.getItem("yeto-splash-seen") : null;
  
  // Handle root path routing
  useEffect(() => {
    if (location === "/" && splashSeen) {
      // Redirect to /home if splash was already seen
      setLocation("/home");
    }
  }, [location, splashSeen, setLocation]);
  
  // Show splash page on root if not seen before OR on /splash route
  if (location === "/splash" || (location === "/" && !splashSeen)) {
    return <Splash />;
  }
  
  // Show loading while redirecting
  if (location === "/" && splashSeen) {
    return null;
  }
  
  return <MainRouter />;
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
            <ReviewModeBanner />
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
