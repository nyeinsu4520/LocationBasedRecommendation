import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Locations from "./pages/Locations";
import ChatPage from "./pages/ChatPage";

function Protected({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/locations" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/locations"
          element={
            <Protected>
              <Locations />
            </Protected>
          }
        />
        <Route
          path="/locations/:locationId/chat"
          element={
            <Protected>
              <ChatPage />
            </Protected>
          }
        />
      </Routes>
      
    </BrowserRouter>
  );
}