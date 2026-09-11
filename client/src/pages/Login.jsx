import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Giris basarisiz");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-base-900 via-base-850 to-base-900">
      <div className="w-full max-w-md bg-base-800 rounded-2xl shadow-panel p-8 animate-fade-in">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal flex items-center justify-center font-extrabold text-base-900 text-lg">N</div>
          <span className="text-2xl font-extrabold text-ink">Nexus</span>
        </div>
        <h1 className="text-xl font-bold text-ink mb-1 text-center">Tekrar hosgeldin</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Devam etmek icin giris yap</p>

        {error && (
          <div className="mb-4 text-sm bg-dnd/10 text-dnd border border-dnd/30 rounded-lg px-3 py-2">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="ornek@mail.com"
            />
          </Field>
          <Field label="Sifre">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="********"
            />
          </Field>
          <button disabled={loading} className="btn-primary mt-2">
            {loading ? "Giris yapiliyor..." : "Giris yap"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-5 text-center">
          Hesabin yok mu?{" "}
          <Link to="/register" className="link">
            Kayit ol
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</span>
      {children}
    </label>
  );
}
