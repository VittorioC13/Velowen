import { lazy, Suspense } from "react";
import { Redirect, Route, Switch } from "wouter";
import HomePage from "./pages/home";
import DataPage from "./pages/data";
import NotFound from "./pages/not-found";
import { useHtmlClass } from "./lib/use-html-class";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/source-serif-4/opsz.css";
import "@fontsource-variable/source-serif-4/opsz-italic.css";

// Studio pulls in three.js and the splat viewer; keep it out of the main bundle
const StudioPage = lazy(() => import("./pages/studio"));
const ImageTo3DPage = lazy(() => import("./pages/image-to-3d"));

// The splat viewer expects its canvas stretched to fill its container
function GeneratorPage() {
  useHtmlClass("lab-canvas");
  return <ImageTo3DPage />;
}

// Old links (the former home scene and /lab) keep working
function To({ path }: { path: string }) {
  return <Redirect to={`${path}${window.location.search}`} replace />;
}

function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-daylight" />}>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/data" component={DataPage} />
        <Route path="/studio" component={StudioPage} />
        <Route path="/studio/image-to-3d" component={GeneratorPage} />
        <Route path="/lab">
          <To path="/studio" />
        </Route>
        <Route path="/lab/image-to-3d">
          <To path="/studio/image-to-3d" />
        </Route>
        <Route path="/image-to-3d">
          <To path="/studio/image-to-3d" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default App;
