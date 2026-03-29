import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatAppPage from "./pages/ChatAppPage";
import { Toaster } from "sonner";

function App() {
  return <>
  <Toaster position="top-right" richColors />
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/chat" element={<ChatAppPage />} />
    </Routes>
  </BrowserRouter>
  </>
}
export default App
