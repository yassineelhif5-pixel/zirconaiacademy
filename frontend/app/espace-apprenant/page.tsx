"use client";

import "../learning-dashboard.css";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

type Registration = {
  id: number; training: string; training_label: string;
  status: string; status_label: string; created_at: string;
};
type Interest = { id: number; product: string; created_at: string };
type Dashboard = {
  profile: { username: string; email: string; first_name?: string; last_name?: string };
  registrations: Registration[]; product_interests: Interest[]; notice?: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(value));
}

export default function EspaceApprenant() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("projectacademy_access");
    if (!token) { router.replace("/connexion"); return; }
    if (!API) { setError("API ProjectAcademy non configurée."); setLoading(false); return; }
    fetch(API + "/api/learning/dashboard/", { headers: { Authorization: "Bearer " + token } })
      .then(async (response) => {
        const body = await response.json();
        if (response.status === 401) {
          sessionStorage.removeItem("projectacademy_access");
          sessionStorage.removeItem("projectacademy_refresh");
          router.replace("/connexion");
          throw new Error("Votre session a expiré.");
        }
        if (!response.ok) throw new Error(body.detail || "Impossible de charger votre espace.");
        setData(body);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main className="chat-page">
      <header className="chat-header">
        <Link href="/" className="auth-brand">ZIRCON<span>AI</span><small>PROJECT ACADEMY</small></Link>
        <div><Link href="/assistant" className="auth-back">Assistant IA ↗</Link><Link href="/connexion" className="auth-back">Connexion</Link></div>
      </header>
      <section className="chat-shell">
        <div className="chat-title">
          <div className="section-kicker">PROJECTACADEMY / ESPACE PERSONNEL</div>
          <h1>Bonjour{data?.profile.first_name ? ", " + data.profile.first_name : ""}.</h1>
          <p>Retrouvez ici vos inscriptions aux formations et vos demandes d'information.</p>
        </div>
        {loading && <p className="auth-intro">Chargement de votre espace…</p>}
        {error && <div className="form-feedback error" role="alert">{error}</div>}
        {data?.notice && <div className="form-feedback">{data.notice}</div>}
        {data && <>
          <div className="dashboard-section">
            <div className="section-kicker">01 / MES FORMATIONS</div><h2>Mes inscriptions</h2>
            {data.registrations.length === 0
              ? <p className="auth-intro">Aucune inscription retrouvée pour {data.profile.email || "votre compte"}. Les demandes sont rapprochées à partir de l'adresse email de votre compte.</p>
              : data.registrations.map((item) => <article className="dashboard-item" key={item.id}>
                  <div><strong>{item.training_label}</strong><small>Demande du {formatDate(item.created_at)}</small></div>
                  <span className="dashboard-status">{item.status_label}</span>
                </article>)}
          </div>
          <div className="dashboard-section">
            <div className="section-kicker">02 / MES INTÉRÊTS</div><h2>Produits suivis</h2>
            {data.product_interests.length === 0
              ? <p className="auth-intro">Aucune demande d'information enregistrée.</p>
              : data.product_interests.map((item) => <article className="dashboard-item" key={item.id}>
                  <div><strong>{item.product}</strong><small>Demande du {formatDate(item.created_at)}</small></div>
                  <span className="dashboard-status">Information demandée</span>
                </article>)}
          </div>
          <p className="auth-footnote">Les demandes sont associées à votre compte via votre adresse email. Si vous avez utilisé une autre adresse lors de l'inscription, elles n'apparaîtront pas ici.</p>
        </>}
        <div className="dashboard-actions"><Link href="/#formations" className="button button-gold">Découvrir les formations ↗</Link><Link href="/assistant" className="button button-ghost">Poser une question à l'IA</Link></div>
      </section>
    </main>
  );
}
