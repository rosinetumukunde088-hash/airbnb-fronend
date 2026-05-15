import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { StoreProvider } from "./store/StoreContext";
import { AuthProvider } from "./features/auth";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <App />
          <Toaster position="bottom-right" />
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
