import { Redirect, Route, Switch } from "wouter";
import HomePage from "./pages/home";
import DataPage from "./pages/data";
import DentalPage from "./pages/dental";
import NotFound from "./pages/not-found";
import "@fontsource-variable/hanken-grotesk";
import "@fontsource-variable/source-serif-4/opsz.css";
import "@fontsource-variable/source-serif-4/opsz-italic.css";

// The Studio (particle world + image-to-3D) is hidden from the site. Its
// pages stay in src/pages/studio.tsx and image-to-3d.tsx; old links to it
// land on the home page.
const HIDDEN = ["/studio", "/studio/*", "/lab", "/lab/*", "/image-to-3d"];

function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/data" component={DataPage} />
      <Route path="/dental" component={DentalPage} />
      {HIDDEN.map((path) => (
        <Route key={path} path={path}>
          <Redirect to="/" replace />
        </Route>
      ))}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
