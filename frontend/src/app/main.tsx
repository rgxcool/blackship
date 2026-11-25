import { createRoot } from "react-dom/client";
import { AppProviders } from "./providers";
import { AppRouter } from "./router";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <AppRouter />
  </AppProviders>,
);
