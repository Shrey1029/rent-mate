
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ItemDetail from "./pages/ItemDetail";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
