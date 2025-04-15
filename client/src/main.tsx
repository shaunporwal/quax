import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Define global chrome object for TypeScript
declare global {
  interface Window {
    chrome: typeof chrome;
  }
}

// In a Chrome extension context, we need to detect if we're running in the extension popup
const isExtensionContext = window.location.pathname.endsWith('popup.html') || 
                          window.chrome?.extension?.getViews !== undefined;

createRoot(document.getElementById("root")!).render(<App isExtensionContext={isExtensionContext} />);
