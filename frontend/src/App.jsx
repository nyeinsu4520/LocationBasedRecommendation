import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Locations from "./pages/Locations";
import ChatPage from "./pages/ChatPage";
import CreateEventPage from "./pages/CreateEventPage"; 

function Protected({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}


function HostOnly({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "HOST" && role !== "HOST_PREMIUM") {
    return <Navigate to="/locations" replace />;
  }
  return children;
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
          path="/events/:eventId/chat"
          element={
            <Protected>
              <ChatPage />
            </Protected>
          }
        />
       
        <Route
          path="/host/create-event"
          element={
            <HostOnly>
              <CreateEventPage />
            </HostOnly>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}