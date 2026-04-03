import { useState } from "react";
import { authApi } from "../api/authApi";
import { useSearchParams } from "react-router-dom";
import logo from "./images/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified");
  const verifyError = searchParams.get("error");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", String(res.userId));
      localStorage.setItem("name", res.name);
      localStorage.setItem("role", res.role); 
      window.location.href = "/locations";
    } catch {
      setErr("Login failed. Check email/password.");
    }
  };
    {verified && (
      <div className="mb-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Email verified! You can now log in.
      </div>
  )}

  {verifyError && (
      <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Invalid or expired verification link. Please register again.
      </div>
  )}

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center">
                    <img
                                src={logo}
                                alt="Evanto"
                                className="h-8 w-8 object-contain"
                                onError={(e) => { e.target.style.display = "none"; }}
                              />
                  </div>
                  <span className="text-lg font-bold text-slate-900">Evanto</span>
                </div>
        <h1 className="text-2xl font-semibold text-slate-900">Login</h1>
        <p className="text-slate-500 mt-1">Welcome back. Please sign in.</p>

        {err && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-slate-900 text-white py-2.5 font-medium hover:bg-slate-800"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          No account?{" "}
          <a className="font-medium text-slate-900 hover:underline" href="/register">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}