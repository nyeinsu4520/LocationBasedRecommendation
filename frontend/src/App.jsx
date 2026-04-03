import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {useState} from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Locations from "./pages/Locations";
import ChatPage from "./pages/ChatPage";
import CreateEventPage from "./pages/CreateEventPage";
import RequestHostPage from "./pages/RequestHostPage";
import AdminDashboard from "./pages/AdminDashboard";
import EventsPage from "./pages/EventPage"; 
import Header from "./pages/components/Header";
import Footer from "./pages/components/Footer";
import HostDashboard from "./pages/HostDashBoard.jsx";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import EditEventPage from "./pages/EditEventPage.jsx"

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

function AdminOnly({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "ADMIN") return <Navigate to="/locations" replace />;
  return children;
}
function AppLayout({ children, onOpenHostDashboard }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header onOpenHostDashboard={onOpenHostDashboard} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  const [hostDashboardOpen, setHostDashboardOpen] = useState(false);
  const token = localStorage.getItem("token");
  return (
    <BrowserRouter>
      <HostDashboard
        open={hostDashboardOpen}
        onClose={() => setHostDashboardOpen(false)}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/locations" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/locations"
          element={
            <Protected>
              <AppLayout onOpenHostDashboard={() => setHostDashboardOpen(true)}>
              <Locations />
            </AppLayout>
            </Protected>
          }
        />
        {/* ✅ Events listing page */}
        <Route
          path="/events"
          element={
            <Protected>
              <AppLayout onOpenHostDashboard={() => setHostDashboardOpen(true)}>
              <EventsPage />
            </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/events/:eventId/chat"
          element={
            <Protected>
              <AppLayout onOpenHostDashboard={() => setHostDashboardOpen(true)}>
              <ChatPage />
            </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/host/create-event"
          element={
            <HostOnly>
              <AppLayout onOpenHostDashboard={() => setHostDashboardOpen(true)}>
              <CreateEventPage />
            </AppLayout>
            </HostOnly>
          }
        />
        <Route
          path="/request-host"
          element={
            <Protected>
              <AppLayout onOpenHostDashboard={() => setHostDashboardOpen(true)}>
              <RequestHostPage />
            </AppLayout>
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminOnly>
              <AppLayout onOpenHostDashboard={() => setHostDashboardOpen(true)}>
              <AdminDashboard />
            </AppLayout>
            </AdminOnly>
          }
        />
        <Route path="/host/edit-event/:eventId" element={
        <HostOnly>
          <AppLayout onOpenHostDashboard={() => setHostDashboardOpen(true)}>
            <EditEventPage />
          </AppLayout>
        </HostOnly>
      } />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
      </Routes>
    </BrowserRouter>
  );
}