import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";

import { AppStateProvider, type User } from "./store";
import { Login, Guard } from "./components/shared";
import { AuthorityDashboard, AuthorityDocuments, NewRelease, DistributionDetails, AuthorityHistory } from "./pages/authority";
import { RecipientDashboard, RecipientDocuments, RecipientDocument, DecryptPage, RecipientHistory } from "./pages/recipient";
import { AdminDashboard, AdminEvents, AdminPqc, AdminLedger, AdminHealth } from "./pages/admin";
import { InvestigatorDashboard, NewInvestigation, AnalysisPage, EvidencePage, ChainNodePage, InvestigatorReports } from "./pages/investigator";

const queryClient = new QueryClient();

function AppRoutes() {
  const [location] = useLocation();
  if (location === "/" || location === "/login") return <Login />;
  if (location.startsWith("/login/")) return <Login preset={location.split("/")[2]} />;
  let user: User | null = null;
  try {
    const saved = localStorage.getItem("sdms-user");
    user = saved ? JSON.parse(saved) as User : null;
  } catch {
    user = null;
  }
  if (!user) return <Login />;
  return <Switch>
    <Route path="/authority/dashboard"><Guard roles={["authority"]}><AuthorityDashboard user={user} /></Guard></Route>
    <Route path="/authority/documents"><Guard roles={["authority"]}><AuthorityDocuments user={user} /></Guard></Route>
    <Route path="/authority/distributions/new"><Guard roles={["authority"]}><NewRelease user={user} /></Guard></Route>
    <Route path="/authority/distributions/:id"><Guard roles={["authority"]}><DistributionDetails user={user} /></Guard></Route>
    <Route path="/authority/history"><Guard roles={["authority"]}><AuthorityHistory user={user} /></Guard></Route>
    <Route path="/recipient/dashboard"><Guard roles={["recipient"]}><RecipientDashboard user={user} /></Guard></Route>
    <Route path="/recipient/documents"><Guard roles={["recipient"]}><RecipientDocuments user={user} /></Guard></Route>
    <Route path="/recipient/documents/:id"><Guard roles={["recipient"]}><RecipientDocument user={user} /></Guard></Route>
    <Route path="/recipient/decrypt/:id"><Guard roles={["recipient"]}><DecryptPage user={user} /></Guard></Route>
    <Route path="/recipient/history"><Guard roles={["recipient"]}><RecipientHistory user={user} /></Guard></Route>
    <Route path="/admin/dashboard"><Guard roles={["admin"]}><AdminDashboard user={user} /></Guard></Route>
    <Route path="/admin/events"><Guard roles={["admin"]}><AdminEvents user={user} /></Guard></Route>
    <Route path="/admin/pqc"><Guard roles={["admin"]}><AdminPqc user={user} /></Guard></Route>
    <Route path="/admin/ledger"><Guard roles={["admin"]}><AdminLedger user={user} /></Guard></Route>
    <Route path="/admin/health"><Guard roles={["admin"]}><AdminHealth user={user} /></Guard></Route>
    <Route path="/investigator/dashboard"><Guard roles={["investigator"]}><InvestigatorDashboard user={user} /></Guard></Route>
    <Route path="/investigator/investigations/new"><Guard roles={["investigator"]}><NewInvestigation user={user} /></Guard></Route>
    <Route path="/investigator/investigations/:id"><Guard roles={["investigator"]}><AnalysisPage user={user} /></Guard></Route>
    <Route path="/investigator/evidence/:id"><Guard roles={["investigator"]}><EvidencePage user={user} /></Guard></Route>
    <Route path="/investigator/chain/:id"><Guard roles={["investigator"]}><ChainNodePage user={user} /></Guard></Route>
    <Route path="/investigator/reports"><Guard roles={["investigator"]}><InvestigatorReports user={user} /></Guard></Route>
    <Route><Login /></Route>
  </Switch>;
}
function App() {
  return <ErrorBoundary><QueryClientProvider client={queryClient}><TooltipProvider><AppStateProvider><WouterRouter><AppRoutes /></WouterRouter></AppStateProvider><Toaster /></TooltipProvider></QueryClientProvider></ErrorBoundary>;
}
export default App;