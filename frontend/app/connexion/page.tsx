"use client";

import Script from "next/script";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

declare global {
  interface Window {
    google?: {
      accounts: { id: {
        initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
        renderButton: (element: HTMLElement, options: { theme: string; size: string; shape: string; width: number; text: string }) => void;
      } };
    };
  }
}

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function Connexion() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function finishLogin(access: string, refresh: string) {
    sessionStorage.setItem("projectacademy_access", access);
    sessionStorage.setItem("projectacademy_refresh", refresh);
    const response = await fetch(API + "/api/auth/me/", { headers: { Authorization: "Bearer " + access } });
    const user = await response.json();
    router.push(user.is_staff ? "/admin" : "/espace-apprenant");
  }

  async function googleCredential(credential: string) {
    if (!API) throw new Error("API ProjectAcademy non configurée.");
    const response = await fetch(API + "/api/auth/google/", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Connexion Google impossible.");
    await finishLogin(data.access, data.refresh);
  }

  function initializeGoogle() {
    if (!GOOGLE_CLIENT_ID || !window.google || !document.getElementById("google-signin")) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        setBusy(true); setError("");
        googleCredential(response.credential)
          .catch((e) => setError(e instanceof Error ? e.message : "Connexion Google impossible."))
          .finally(() => setBusy(false));
      },
    });
    const target = document.getElementById("google-signin");
    if (target) {
      target.innerHTML = "";
      window.google.accounts.id.renderButton(target, {
        theme: "filled_black", size: "large", shape: "pill", width: 320, text: "continue_with",
      });
    }
  }

  useEffect(() => { initializeGoogle(); }, [mode]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    const f = new FormData(e.currentTarget);
    const username = String(f.get("username") || "").trim();
    const password = String(f.get("password") || "");
    try {
      if (!API) throw new Error("API ProjectAcademy non configurée.");
      if (mode === "register") {
        const payload = {
          username, password, email: String(f.get("email") || "").trim(),
          first_name: String(f.get("first_name") || "").trim(),
          last_name: String(f.get("last_name") || "").trim(),
        };
        const reg = await fetch(API + "/api/auth/register/", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        const d = await reg.json();
        if (!reg.ok) throw new Error(Object.values(d).flat().join(" "));
      }
      const res = await fetch(API + "/api/auth/token/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.detail || "Identifiants incorrects.");
      await finishLogin(d.access, d.refresh);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally { setBusy(false); }
  }

  return <>
    {GOOGLE_CLIENT_ID && <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initializeGoogle} />}
    <main className="auth-page"><section className="auth-card">
      <Link href="/" className="auth-brand">ZIRCON<span>AI</span><small>PROJECT ACADEMY</small></Link>
      <div className="section-kicker">ESPACE MEMBRE / ACCÈS SÉCURISÉ</div>
      <h1>{mode === "login" ? "Heureux de vous revoir." : "Rejoignez ProjectAcademy."}</h1>
      <p className="auth-intro">Accédez à votre espace personnel et suivez vos formations.</p>
      <div className="auth-tabs">
        <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Connexion</button>
        <button className={mode === "register" ? "active" : ""} onClick={() => { setMode("register"); setError(""); }}>Créer un compte</button>
      </div>
      <form className="auth-form" onSubmit={submit}>
        {mode === "register" && <>
          <label>Prénom<input name="first_name" required maxLength={150} /></label>
          <label>Nom<input name="last_name" required maxLength={150} /></label>
          <label>Email<input name="email" type="email" required maxLength={254} /></label>
        </>}
        <label>Identifiant<input name="username" required minLength={3} maxLength={150} /></label>
        <label>Mot de passe<input name="password" type="password" required minLength={mode === "register" ? 12 : 1} maxLength={128} /></label>
        {mode === "register" && <p className="auth-hint">12 caractères minimum.</p>}
        {error && <div className="form-feedback error" role="alert">{error}</div>}
        <button className="button button-gold" disabled={busy}>{busy ? "Veuillez patienter…" : mode === "login" ? "Se connecter ↗" : "Créer mon compte ↗"}</button>
      </form>
      <div className="google-divider">OU CONTINUER AVEC GOOGLE</div>
      {GOOGLE_CLIENT_ID ? <div id="google-signin" className="google-signin" /> : <p className="auth-hint">Connexion Google disponible après configuration de GOOGLE_CLIENT_ID.</p>}
      <p className="auth-footnote">Un espace personnel est créé automatiquement à la première connexion.</p>
      <Link href="/" className="auth-back">← Retour au site ZirconAI</Link>
    </section></main>
  </>;
}
