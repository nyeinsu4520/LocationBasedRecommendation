import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import logo from "./images/logo.png";

function getPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  return { checks, passed };
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const { checks, passed } = getPasswordStrength(password);

  const strengthLabel = passed <= 2 ? "Weak" : passed <= 3 ? "Fair" : passed === 4 ? "Good" : "Strong";
  const strengthColor = passed <= 2 ? "bg-red-400" : passed <= 3 ? "bg-amber-400" : passed === 4 ? "bg-blue-400" : "bg-green-500";
  const strengthTextColor = passed <= 2 ? "text-red-500" : passed <= 3 ? "text-amber-500" : passed === 4 ? "text-blue-500" : "text-green-600";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pwd)) return "Password must include at least one uppercase letter (A-Z).";
    if (!/[a-z]/.test(pwd)) return "Password must include at least one lowercase letter (a-z).";
    if (!/[0-9]/.test(pwd)) return "Password must include at least one number (0-9).";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return "Password must include at least one symbol (!@#$%^&*).";
    return null;
  };

const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!name.trim()) return setErr("Name is required.");
    if (!email.trim()) return setErr("Email is required.");
    if (!password) return setErr("Password is required.");

    // ✅ Hard block — must pass all 5 requirements
    if (passed < 5) {
        const missing = [];
        if (!checks.length) missing.push("at least 8 characters");
        if (!checks.uppercase) missing.push("an uppercase letter (A-Z)");
        if (!checks.lowercase) missing.push("a lowercase letter (a-z)");
        if (!checks.number) missing.push("a number (0-9)");
        if (!checks.symbol) missing.push("a symbol (!@#$%^&*)");
        return setErr(`Password must include: ${missing.join(", ")}.`);
    }

    if (password !== confirmPassword) return setErr("Passwords do not match.");

    try {
        setLoading(true);
        await authApi.register({ name, email, password, phoneNumber: phone });
        setRegistered(true);
    } catch (error) {
        setErr(error.response?.data || "Register failed. Email might already exist.");
    } finally {
        setLoading(false);
    }
};

  if (registered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <img src={logo} alt="Evanto" className="h-8 w-8 object-contain"
              onError={(e) => { e.target.style.display = "none"; }} />
            <span className="text-lg font-bold text-slate-900">Evanto</span>
          </div>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Check your email!</h2>
          <p className="text-slate-500 mt-2 text-sm leading-relaxed">
            We sent a verification link to{" "}
            <span className="font-semibold text-slate-800">{email}</span>.
            <br />Click the link to activate your account.
          </p>
          <div className="mt-5 bg-slate-50 rounded-xl p-4 text-left space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold shrink-0">1</span>
              <span className="text-sm text-slate-600">Open your email inbox</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold shrink-0">2</span>
              <span className="text-sm text-slate-600">Find the email from Evanto</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold shrink-0">3</span>
              <span className="text-sm text-slate-600">Click <strong>"Verify Email"</strong> to activate</span>
            </div>
          </div>
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <p className="text-xs text-amber-700 text-left">
              Didn't receive it? Check your <strong>spam or junk folder</strong>.
            </p>
          </div>
          <div className="border-t border-slate-100 my-5" />
          <Link to="/login"
            className="w-full inline-block rounded-xl bg-slate-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors">
            Back to login
          </Link>
          <p className="mt-3 text-xs text-slate-400">Link expires in 24 hours</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">

        <div className="flex items-center gap-2 mb-4">
          <img src={logo} alt="Evanto" className="h-8 w-8 object-contain"
            onError={(e) => { e.target.style.display = "none"; }} />
          <span className="text-lg font-bold text-slate-900">Evanto</span>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>
        <p className="text-slate-500 mt-1 text-sm">Join Evanto and find events near you.</p>

        {err && (
          <div className="mt-4 rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm">{err}</div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Phone Number
              <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="tel"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="e.g. +44 7911 123456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          <div>
  <label className="text-sm font-medium text-slate-700">Password</label>
  <div className="relative mt-1">
    <input
      type={showPassword ? "text" : "password"}
      className={`w-full rounded-xl border px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${
        password.length > 0 && passed < 5
          ? "border-red-300 bg-red-50"
          : password.length > 0 && passed === 5
          ? "border-green-300 bg-green-50"
          : "border-slate-200"
      }`}
      placeholder="Min 8 chars with A-Z, a-z, 0-9, symbol"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      autoComplete="new-password"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
      {showPassword ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      )}
    </button>
  </div>

  {/* Strength bar and checklist unchanged */}
  {password.length > 0 && (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
            i <= passed ? strengthColor : "bg-slate-200"
          }`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${strengthTextColor}`}>{strengthLabel}</p>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {[
          { key: "length", label: "8+ characters" },
          { key: "uppercase", label: "Uppercase (A-Z)" },
          { key: "lowercase", label: "Lowercase (a-z)" },
          { key: "number", label: "Number (0-9)" },
          { key: "symbol", label: "Symbol (!@#$...)" },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1">
            <span className={`text-xs ${checks[key] ? "text-green-500" : "text-slate-300"}`}>
              {checks[key] ? "✓" : "○"}
            </span>
            <span className={`text-xs ${checks[key] ? "text-green-600" : "text-slate-400"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

        <div>
  <label className="text-sm font-medium text-slate-700">Confirm Password</label>
  <div className="relative mt-1">
    <input
      type={showConfirm ? "text" : "password"}
      className={`w-full rounded-xl border px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${
        confirmPassword && password !== confirmPassword
          ? "border-red-300 bg-red-50"
          : confirmPassword && password === confirmPassword
          ? "border-green-300 bg-green-50"
          : "border-slate-200"
      }`}
      placeholder="••••••••"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      autoComplete="new-password"
    />
    {/* ✅ Eye toggle button */}
    <button
      type="button"
      onClick={() => setShowConfirm(!showConfirm)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
    >
      {showConfirm ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      )}
    </button>
  </div>
  {confirmPassword && (
    <p className={`mt-1 text-xs ${password === confirmPassword ? "text-green-600" : "text-red-500"}`}>
      {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
    </p>
  )}
</div>

        <button
          type="submit"
          disabled={loading || passed < 5 || password !== confirmPassword}
          className="w-full rounded-xl py-2.5 text-sm font-medium mt-2 transition-colors bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
        </form>

        <p className="mt-4 text-sm text-slate-600 text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-slate-900 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}