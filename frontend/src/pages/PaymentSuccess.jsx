import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { paymentApi } from "../api/paymentApi";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("userId");
          localStorage.removeItem("name");
          navigate("/login");
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full mx-4 text-center">

        <h1 className="text-2xl font-bold text-slate-900">Payment successful!</h1>
        <p className="text-slate-500 mt-2">
          Welcome to Evanto Premium. You can now host events with up to 50 attendees.
        </p>

        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 justify-center mb-1">
            <p className="text-sm font-semibold text-amber-800">
              Please log back in to activate premium
            </p>
          </div>
          <p className="text-xs text-amber-700">
            Your session needs to refresh to apply your new Premium role.
          </p>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          Redirecting to login in <span className="font-bold text-slate-700">{countdown}</span> seconds...
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            localStorage.removeItem("name");
            navigate("/login");
          }}
          className="mt-5 w-full rounded-xl bg-slate-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-slate-800"
        >
          Log in now to activate Premium
        </button>

      </div>
    </div>
  );
}