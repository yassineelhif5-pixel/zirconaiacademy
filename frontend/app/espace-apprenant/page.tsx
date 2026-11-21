"use client";

import "../learning-dashboard.css";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RichText from "../lib/RichText";

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "").replace(/\/api$/, "");

type Registration = {
  id: number; training: string; training_label: string;
  status: string; status_label: string; confirmed_date: string | null; created_at: string;
};
type Interest = { id: number; product: string; created_at: string };
type Proposal = {
  id: number; title: string; need: string; analysis: string; company: string;
  status: string; status_label: string; admin_note: string; created_at: string; updated_at: string;
};
type Dashboard = {
  profile: { username: string; email: string; first_name?: string; last_name?: string };
  registrations: Registration[]; product_interests: Interest[]; project_proposals?: Proposal[]; notice?: string;
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
          <p>Retrouvez ici vos propositions de projet, vos inscriptions aux formations et vos demandes d'information.</p>
        </div>
        {loading && <p className="auth-intro">Chargement de votre espace…</p>}
        {error && <div className="form-feedback error" role="alert">{error}</div>}
        {data?.notice && <div className="form-feedback">{data.notice}</div>}
        {data && <>
          <div className="dashboard-section" id="projets">
            <div className="section-kicker">01 / MES PROJETS</div><h2>Mes propositions de projet</h2>
            {(data.project_proposals ?? []).length === 0
              ? <p className="auth-intro">Aucune proposition pour le moment. Décrivez votre besoin au conseiller IA : il vous propose une approche de principe que vous pouvez ensuite nous soumettre.</p>
              : (data.project_proposals ?? []).map((item) => <article className="proposal-item" key={item.id}>
                  <div className="proposal-head">
                    <div><strong>{item.title}</strong><small>{item.company ? item.company + " · " : ""}Envoyée le {formatDate(item.created_at)}</small></div>
                    <span className={`dashboard-status proposal-status ${item.status}`}>{item.status_label}</span>
                  </div>
                  {item.admin_note && <div className="proposal-note"><b>Réponse de l&apos;équipe ZirconAI</b><p>{item.admin_note}</p><small>Mise à jour le {formatDate(item.updated_at)}</small></div>}
                  <details className="proposal-details">
                    <summary>Voir mon besoin et l&apos;analyse de principe</summary>
                    <h5>Mon besoin</h5><p className="proposal-need">{item.need}</p>
                    {item.analysis && <><h5>Analyse de principe</h5><div className="proposal-analysis"><RichText text={item.analysis} /></div></>}
                  </details>
                </article>)}
            <div className="dashboard-actions"><Link href="/#projet" className="button button-gold">Démarrer un nouveau projet ↗</Link></div>
          </div>
          <div className="dashboard-section">
            <div className="section-kicker">02 / MES FORMATIONS</div><h2>Mes inscriptions</h2>
            {data.registrations.length === 0
              ? <p className="auth-intro">Aucune inscription retrouvée pour {data.profile.email || "votre compte"}. Les demandes sont rapprochées à partir de l'adresse email de votre compte.</p>
              : data.registrations.map((item) => <article className="dashboard-item" key={item.id}>
                  <div><strong>{item.training_label}</strong><small>Demande du {formatDate(item.created_at)}</small></div>
                  <span className="dashboard-status">{item.status === "confirmed" ? "Formation confirmée" : item.status_label}</span>{item.confirmed_date && <small className="learner-session-date">Session prévue le {new Intl.DateTimeFormat("fr-FR",{dateStyle:"long"}).format(new Date(item.confirmed_date+"T12:00:00"))}</small>}
                </article>)}
          </div>
          <div className="dashboard-section">
            <div className="section-kicker">03 / MES INTÉRÊTS</div><h2>Produits suivis</h2>
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
