"use client";

import { useEffect, useState } from "react";

/**
 * Chiffres et références ZirconShield AI affichés dans la fenêtre d'information.
 * À maintenir par ZirconAI : n'ajoutez ici que des clients ayant donné leur accord écrit
 * pour être cités, et des chiffres que vous pouvez justifier.
 */
export const SHIELD_FACTS = {
  clients: 12,
  efficacy: "99 %",
  efficacyNote: "Taux de blocage des attaques détectées, selon les mesures internes de ZirconAI.",
  references: [] as { name: string; sector: string }[],
};

const PROTECTIONS = [
  { title: "Attaques cyber", items: ["Hameçonnage et liens malveillants", "Vol d'identifiants et de sessions", "Fuite et exfiltration de données sensibles"] },
  { title: "Attaques IA", items: ["Injection de prompt et jailbreak", "Fuite de données vers les outils d'IA générative", "Contenus et agents IA détournés"] },
  { title: "Reporting", items: ["Tableau de bord des menaces en temps réel", "Alertes et journal d'audit horodaté", "Rapport mensuel pour la direction et la conformité"] },
];

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 72" aria-hidden="true">
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3b0" /><stop offset=".35" stopColor="#f5c542" /><stop offset=".7" stopColor="#c8901a" /><stop offset="1" stopColor="#f7d774" />
        </linearGradient>
        <linearGradient id="goldEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff7cc" /><stop offset="1" stopColor="#9a6a0c" /></linearGradient>
      </defs>
      <path d="M32 2 60 12v22c0 18-12 30-28 36C16 64 4 52 4 34V12Z" fill="url(#gold)" stroke="url(#goldEdge)" strokeWidth="2" />
      <path d="M32 9 53 17v17c0 14-9 24-21 29C20 58 11 48 11 34V17Z" fill="none" stroke="#7a5208" strokeOpacity=".35" strokeWidth="1.2" />
      <path d="M22 26h20L22 46h20" fill="none" stroke="#5a3a02" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ShieldStamp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button type="button" className="shield-stamp" onClick={() => setOpen(true)} aria-label="Votre navigation est protégée par ZirconAI Shield — en savoir plus">
        <svg className="shield-stamp-ring" viewBox="0 0 200 200" aria-hidden="true">
          <defs><path id="stampCircle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
          <circle cx="100" cy="100" r="96" />
          <circle cx="100" cy="100" r="62" />
          <text><textPath href="#stampCircle" startOffset="0" textLength="486" lengthAdjust="spacing">VOTRE NAVIGATION EST PROTÉGÉE ✦ ZIRCONAI SHIELD ✦ </textPath></text>
        </svg>
        <span className="shield-stamp-core"><ShieldIcon /></span>
        <span className="shield-stamp-tip">Protégé · en savoir plus</span>
      </button>

      {open && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <section className="modal-panel shield-modal" role="dialog" aria-modal="true" aria-labelledby="shield-title">
            <button className="modal-close" onClick={() => setOpen(false)} aria-label="Fermer">×</button>
            <div className="shield-modal-hero">
              <ShieldIcon className="shield-modal-icon" />
              <div>
                <div className="zx-kicker">ZirconAI Shield · Plugin IA de protection</div>
                <h2 id="shield-title">Une protection intelligente contre les attaques cyber et IA.</h2>
              </div>
            </div>
            <p>ZirconShield AI est un plugin de protection piloté par l&apos;IA. Il analyse en continu la navigation et les usages de l&apos;intelligence artificielle, détecte les comportements suspects et bloque les attaques avant qu&apos;elles n&apos;atteignent vos données, puis en rend compte dans des rapports clairs.</p>

            <div className="shield-stats">
              <div><strong>{SHIELD_FACTS.clients}</strong><span>clients équipés</span></div>
              <div><strong>{SHIELD_FACTS.efficacy}</strong><span>d&apos;attaques bloquées*</span></div>
              <div><strong>24/7</strong><span>surveillance et alertes</span></div>
            </div>

            <div className="shield-grid">
              {PROTECTIONS.map((block) => (
                <article key={block.title}>
                  <h4>{block.title}</h4>
                  <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              ))}
            </div>

            <h4>Ils nous font confiance</h4>
            {SHIELD_FACTS.references.length > 0 ? (
              <ul className="shield-clients">{SHIELD_FACTS.references.map((c) => <li key={c.name}><b>{c.name}</b><small>{c.sector}</small></li>)}</ul>
            ) : (
              <p className="shield-clients-empty">{SHIELD_FACTS.clients} organisations utilisent déjà ZirconShield AI. Leurs références sont communiquées sur demande, avec leur accord.</p>
            )}

            <div className="zx-actions">
              <a className="zx-btn zx-btn-primary" href="mailto:contact@zirconai.fr?subject=ZirconShield%20AI%20%E2%80%94%20demande%20d'information">Protéger mon entreprise <span aria-hidden="true">→</span></a>
              <button type="button" className="zx-btn zx-btn-ghost" onClick={() => setOpen(false)}>Fermer</button>
            </div>
            <p className="fine-print">* {SHIELD_FACTS.efficacyNote} Contact : contact@zirconai.fr</p>
          </section>
        </div>
      )}
    </>
  );
}
