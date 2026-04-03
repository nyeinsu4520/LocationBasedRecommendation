import { Link } from "react-router-dom";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full mx-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Payment cancelled</h1>
        <p className="text-slate-500 mt-2">
          No worries — you haven't been charged. You can upgrade anytime from your dashboard.
        </p>
        <Link
          to="/locations"
          className="mt-5 inline-block rounded-xl bg-slate-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-slate-800"
        >
          Back to app
        </Link>
      </div>
    </div>
  );
}