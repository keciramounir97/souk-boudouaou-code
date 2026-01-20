import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/themeContext.jsx";
import { TranslationProvider } from "./context/translationContext.jsx";
import { CategoryProvider } from "./context/categoryContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root container #root not found in index.html");
}

createRoot(rootEl).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <TranslationProvider>
          <ToastProvider>
            <CategoryProvider>
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </CategoryProvider>
          </ToastProvider>
        </TranslationProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
