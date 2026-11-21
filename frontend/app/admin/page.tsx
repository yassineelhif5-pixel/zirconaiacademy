"use client";

import "./admin.css";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
type RequestItem = {
  id: number; training_label: string; full_name: string; email: string;
  status: string; status_label: string; confirmed_date: string | null; created_at: string;
};
type UserItem = { id: number; username: string; email: string; first_name: string; last_name: string; is_active: boolean; is_staff: boolean; date_joined: string };
type Overview = { counts: { users: number; active_users: number; pending: number; confirmed: number; interests: number }; registrations: RequestItem[]; users: UserItem[]; product_interests: {id:number;product:string;full_name:string;email:string;created_at:string}[] };

export default function Administration() {
  const router = useRouter();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [dates, setDates] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    const token = sessionStorage.getItem("projectacademy_access");
    if (!token) { router.replace("/connexion"); return; }
    if (!API) { setError("API non configurée."); return; }
    const response = await fetch(API + "/api/admin/overview/", { headers: { Authorization: "Bearer " + token } });
    const body = await response.json();
    if (response.status === 401 || response.status === 403) {
      setError("Accès réservé aux administrateurs. Connectez-vous avec un compte administrateur.");
      return;
    }
    if (!response.ok) throw new Error(body.detail || "Chargement impossible.");
    setData(body);
  }, [router]);

  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);

  async function updateRequest(id: number, status: string) {
    const token = sessionStorage.getItem("projectacademy_access");
    setBusy(id); setError("");
    try {
      const date = dates[id];
      if (status === "confirmed" && !date) throw new Error("Choisissez une date avant d'accepter la demande.");
      const response = await fetch(API + "/api/admin/registrations/" + id + "/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ status, ...(date ? { confirmed_date: date } : {}) }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || JSON.stringify(body));
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur."); }
    finally { setBusy(null); }
  }

  async function toggleUser(user: UserItem) {
    const token = sessionStorage.getItem("projectacademy_access");
    setBusy(-user.id); setError("");
    try {
      const response = await fetch(API + "/api/admin/users/" + user.id + "/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || "Modification impossible.");
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erreur."); }
    finally { setBusy(null); }
  }

  const shown = data?.registrations.filter((item) => filter === "all" || item.status === filter) ?? [];

  return <main className="chat-page">
    <header className="chat-header"><Link href="/" className="auth-brand">ZIRCON<span>AI</span><small>ADMINISTRATION PROJECT ACADEMY</small></Link><button onClick={() => { sessionStorage.clear(); router.replace("/connexion"); }}>Déconnexion</button></header>
    <section className="admin-shell">
      <div className="chat-title"><div className="section-kicker">CONSOLE / ACCÈS ADMINISTRATEUR</div><h1>Administration <em>ProjectAcademy.</em></h1><p>Demandes de formation, planification des sessions et gestion des comptes.</p></div>
      {error && <div className="form-feedback error" role="alert">{error}</div>}
      {!data && !error && <p className="auth-intro">Chargement…</p>}
      {data && <>
        <div className="admin-kpis">
          <article><small>UTILISATEURS</small><strong>{data.counts.users}</strong></article>
          <article><small>DEMANDES EN ATTENTE</small><strong>{data.counts.pending}</strong></article>
          <article><small>INSCRIPTIONS CONFIRMÉES</small><strong>{data.counts.confirmed}</strong></article>
          <article><small>INTÉRÊTS PRODUITS</small><strong>{data.counts.interests}</strong></article>
        </div>
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><div className="section-kicker">01 / INSCRIPTIONS</div><h2>Demandes de formation</h2></div>
            <select value={filter} onChange={(e)=>setFilter(e.target.value)}><option value="all">Toutes</option><option value="received">À traiter</option><option value="reviewing">En cours</option><option value="confirmed">Acceptées</option><option value="cancelled">Refusées</option></select>
          </div>
          {shown.length === 0 && <p className="auth-intro">Aucune demande pour ce filtre.</p>}
          {shown.map((item)=><article className="admin-request" key={item.id}>
            <div className="admin-request-info"><strong>{item.full_name}</strong><span>{item.email}</span><span>{item.training_label} · {item.status_label}</span><small>Demande du {new Intl.DateTimeFormat("fr-FR",{dateStyle:"medium"}).format(new Date(item.created_at))}</small>
              {item.confirmed_date && <small>Date confirmée : {new Intl.DateTimeFormat("fr-FR",{dateStyle:"long"}).format(new Date(item.confirmed_date+"T12:00:00"))}</small>}
            </div>
            <div className="admin-request-actions"><label>Date de session<input type="date" min={new Date().toISOString().slice(0,10)} value={dates[item.id] ?? item.confirmed_date ?? ""} onChange={(e)=>setDates((old)=>({...old,[item.id]:e.target.value}))}/></label>
              <button disabled={busy===item.id} onClick={()=>updateRequest(item.id,"confirmed")}>Accepter</button>
              <button className="admin-danger" disabled={busy===item.id} onClick={()=>updateRequest(item.id,"cancelled")}>Refuser</button>
              <button className="admin-secondary" disabled={busy===item.id} onClick={()=>updateRequest(item.id,"reviewing")}>En cours</button>
            </div>
          </article>)}
        </section>
        <section className="admin-panel"><div className="section-kicker">02 / COMPTES</div><h2>Gestion des utilisateurs</h2>
          {data.users.map((user)=><article className="admin-user" key={user.id}><div><strong>{user.first_name} {user.last_name} (@{user.username})</strong><small>{user.email} · {user.is_staff?"Administrateur":"Apprenant"}</small></div><button disabled={user.is_staff||busy===-user.id} onClick={()=>toggleUser(user)}>{user.is_active?"Désactiver":"Réactiver"}</button></article>)}
        </section>
        <section className="admin-panel"><div className="section-kicker">03 / INTÉRÊTS PRODUITS</div><h2>Demandes d'information</h2>
          {data.product_interests.map((item)=><article className="admin-user" key={item.id}><div><strong>{item.product}</strong><small>{item.full_name} · {item.email}</small></div></article>)}
        </section>
      </>}
    </section>
  </main>;
}
