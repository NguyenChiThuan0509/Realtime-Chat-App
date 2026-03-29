import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatAppPage from "./pages/ChatAppPage";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return <>
  <Toaster position="top-right" richColors />
  <BrowserRouter>
    <Routes>
      <Route path="/signin" element={<LoginPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<ChatAppPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/chat" replace />} />
    </Routes>
  </BrowserRouter>
  </>
}
export default App
