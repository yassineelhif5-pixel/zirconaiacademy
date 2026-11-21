"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import RichText from "./lib/RichText";
import { API, authFetch, isLoggedIn } from "./lib/auth";

type Message = { role: "user" | "assistant"; content: string; source?: "ai" | "guided" };

const DRAFT_KEY = "projectacademy_project_draft";

const GREETING =
  "Bonjour, je suis le conseiller projet de ZirconAI.\n\nDécrivez-moi votre besoin en quelques phrases : votre activité, le problème à résoudre et ce que vous imaginez. Je vous propose une **première approche de principe**, puis un expert ZirconAI pourra l'affiner avec vous.";

const SUGGESTIONS = [
  "Un assistant IA qui répond à nos clients à partir de notre documentation",
  "Automatiser la prospection commerciale et le suivi des leads",
  "Sécuriser l'usage de l'IA générative dans mon entreprise",
  "Une plateforme SaaS pour piloter nos projets et nos KPI",
];

/* ------------------------------------------------------------------ */
/*  Moteur d'analyse guidé (utilisé si l'IA serveur n'est pas active)  */
/* ------------------------------------------------------------------ */

type Domain = {
  id: string;
  keywords: RegExp;
  label: string;
  steps: string[];
  bricks: string[];
  questions: string[];
};

const DOMAINS: Domain[] = [
  {
    id: "assistant",
    keywords: /chat ?bot|assistant|rag|llm|gpt|agent|ia g[ée]n[ée]rative|question|faq|support|base de connaissance|documentation/i,
    label: "un assistant IA conversationnel alimenté par vos propres connaissances",
    steps: ["Inventorier les sources de connaissance (documents, FAQ, outils métier)", "Concevoir une architecture RAG : indexation, recherche sémantique, génération encadrée", "Définir les garde-fous : périmètre des réponses, citations des sources, escalade vers un humain", "Prototyper sur un cas d'usage prioritaire puis mesurer la qualité des réponses"],
    bricks: ["Modèle de langage (LLM) choisi selon vos contraintes de confidentialité", "Base vectorielle et pipeline d'indexation", "Agents IA connectés à vos outils via API", "Formation **AI Future Architect** pour vos équipes (gratuite, 4 h)"],
    questions: ["Quels types de documents ou de données l'assistant doit-il exploiter ?", "Qui l'utilisera : vos clients, vos équipes, ou les deux ?", "Avez-vous des contraintes d'hébergement des données (France/UE, on-premise) ?"],
  },
  {
    id: "growth",
    keywords: /prospect|lead|commercial|vente|crm|campagne|marketing|client[s]? potentiel|acquisition|emailing|linkedin/i,
    label: "un dispositif d'accélération commerciale assisté par l'IA",
    steps: ["Clarifier vos cibles, vos canaux et votre cycle de vente", "Structurer les campagnes et la qualification des leads", "Automatiser la rédaction et le suivi tout en gardant la validation humaine", "Piloter la performance avec des indicateurs simples"],
    bricks: ["**GrowthAI** — plateforme ZirconAI disponible dès aujourd'hui", "Connexion à votre CRM et à vos outils d'emailing", "Assistant de rédaction et scoring des leads"],
    questions: ["Quel volume de prospects visez-vous par mois ?", "Utilisez-vous déjà un CRM ? Lequel ?", "Sur quels canaux prospectez-vous aujourd'hui ?"],
  },
  {
    id: "pilotage",
    keywords: /projet|pilotage|kpi|tableau de bord|dashboard|reporting|portefeuille|suivi|indicateur|pmo|planning|risque/i,
    label: "une tour de contrôle pour piloter vos projets et vos indicateurs",
    steps: ["Recenser les projets, les responsables et les indicateurs clés", "Centraliser les données de suivi dans un référentiel unique", "Mettre en place tableaux de bord, alertes et gestion des risques", "Industrialiser le reporting vers la direction"],
    bricks: ["**Smart Tower Project** — plateforme ZirconAI disponible dès aujourd'hui", "Connecteurs vers vos outils existants (tableurs, gestion de tickets, ERP)", "Synthèses automatiques générées par IA"],
    questions: ["Combien de projets et d'utilisateurs faut-il suivre ?", "Où sont vos données de suivi aujourd'hui ?", "Quels indicateurs sont indispensables pour la direction ?"],
  },
  {
    id: "cyber",
    keywords: /s[ée]curi|cyber|rgpd|conformit|phishing|hame[çc]onnage|attaque|risque[s]? ia|gouvernance|protection des donn|nis ?2|iso ?27001|audit/i,
    label: "une démarche de cybersécurité et de gouvernance des usages de l'IA",
    steps: ["Cartographier les actifs, les données sensibles et les usages de l'IA", "Évaluer les risques : fuite de données, prompt injection, ingénierie sociale", "Définir une politique d'usage et les contrôles techniques adaptés", "Sensibiliser les équipes et suivre un plan de remédiation"],
    bricks: ["**ZirconShield AI** — en préparation (vous pouvez demander à être informé du lancement)", "Registre des risques et plan d'action priorisé", "Formation **AI Cyber Defense** pour vos équipes (gratuite, 4 h)"],
    questions: ["Quelle est la taille de votre organisation et votre secteur ?", "Vos équipes utilisent-elles déjà des outils d'IA générative ?", "Êtes-vous soumis à une réglementation particulière (RGPD, NIS2, santé, finance) ?"],
  },
  {
    id: "docs",
    keywords: /document|ged|facture|contrat|ocr|archiv|scan|pdf|classement|courrier|dossier/i,
    label: "une gestion documentaire intelligente",
    steps: ["Identifier les flux documentaires et les volumes", "Automatiser la capture, l'OCR et l'extraction des informations clés", "Classer, indexer et rendre les documents retrouvables en langage naturel", "Tracer les validations et les workflows"],
    bricks: ["**Docyra AI** — en préparation", "OCR et extraction de données par IA", "Recherche sémantique dans vos archives"],
    questions: ["Quels types de documents et quels volumes mensuels ?", "Où sont-ils stockés aujourd'hui ?", "Quelles informations faut-il en extraire ?"],
  },
  {
    id: "stock",
    keywords: /stock|inventaire|approvisionn|entrep[ôo]t|logistique|commande fournisseur|rupture|r[ée]assort/i,
    label: "un pilotage intelligent des stocks et des approvisionnements",
    steps: ["Cartographier vos sites, articles et flux", "Fiabiliser les données de stock et les mouvements", "Mettre en place des alertes de seuil et des prévisions", "Automatiser les propositions de réapprovisionnement"],
    bricks: ["**StockPilot AI** — en préparation", "Prévision de la demande par apprentissage automatique", "Intégration à votre ERP ou à vos outils de caisse"],
    questions: ["Combien de sites et de références gérez-vous ?", "Quel outil utilisez-vous aujourd'hui pour les stocks ?", "Quelles ruptures ou surstocks vous coûtent le plus ?"],
  },
  {
    id: "learning",
    keywords: /formation|former|apprentissage|comp[ée]tence|e-?learning|p[ée]dagog|cours|[ée]l[èe]ve|[ée]tudiant|onboarding/i,
    label: "un dispositif de formation et de montée en compétences",
    steps: ["Définir les compétences cibles et le niveau de départ", "Construire des parcours adaptatifs et des évaluations", "Ajouter un assistant pédagogique pour accompagner les apprenants", "Suivre la progression et ajuster les contenus"],
    bricks: ["**ZirconAcademy AI** — en préparation", "Formations ProjectAcademy gratuites : **AI Cyber Defense** et **AI Future Architect**", "Assistant pédagogique basé sur vos contenus"],
    questions: ["Combien d'apprenants et quel public ?", "Disposez-vous déjà de contenus de formation ?", "Formation en présentiel, à distance ou hybride ?"],
  },
  {
    id: "saas",
    keywords: /saas|plateforme|application|appli|site|web|mobile|logiciel|outil interne|portail|marketplace|api/i,
    label: "la conception d'une plateforme ou d'une application sur mesure",
    steps: ["Cadrer les utilisateurs, les parcours clés et le périmètre d'un MVP", "Concevoir une architecture évolutive et sécurisée (API, données, authentification)", "Développer par itérations courtes avec des démonstrations régulières", "Déployer, mesurer l'usage et enrichir avec des fonctions IA"],
    bricks: ["Frontend moderne (Next.js / React) et API (Django / Node)", "Base de données PostgreSQL et hébergement cloud européen", "Fonctions IA intégrées : recherche, recommandations, automatisations"],
    questions: ["Qui sont les utilisateurs principaux et combien sont-ils ?", "Quelle est la fonctionnalité indispensable de la première version ?", "Avez-vous une échéance importante (lancement, salon, levée de fonds) ?"],
  },
];

function guidedAnalysis(history: Message[]): string {
  const userTurns = history.filter((m) => m.role === "user");
  const allText = userTurns.map((m) => m.content).join(" \n ");
  const last = userTurns[userTurns.length - 1]?.content ?? "";

  if (last.trim().split(/\s+/).length < 4 && userTurns.length === 1) {
    return "Pour vous proposer une approche pertinente, pouvez-vous m'en dire un peu plus ?\n\n- Quelle est votre activité ?\n- Quel problème voulez-vous résoudre ?\n- Qui utilisera la solution ?";
  }

  const scored = DOMAINS.map((d) => ({ d, score: (allText.match(new RegExp(d.keywords.source, "gi")) || []).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  const picked = (scored.length ? scored.slice(0, 2).map((x) => x.d) : [DOMAINS.find((d) => d.id === "saas")!]);
  const main = picked[0];
  const second = picked[1];

  const refining = userTurns.length > 1;
  const intro = refining
    ? `Merci pour ces précisions, je les intègre à l'analyse.\n\n### Ce que je comprends\nVotre projet s'oriente vers **${main.label}**${second ? `, avec une dimension complémentaire : ${second.label}` : ""}.`
    : `### Ce que je comprends\nVous cherchez à mettre en place **${main.label}**${second ? `, en lien avec ${second.label}` : ""}.`;

  const steps = main.steps.slice(0, second ? 3 : 4);
  if (second) steps.push(second.steps[1]);
  const bricks = [...main.bricks, ...(second ? second.bricks.slice(0, 1) : [])];
  const questions = refining
    ? ["Quel calendrier envisagez-vous pour un premier pilote ?", "Qui sera l'interlocuteur côté métier pour valider les choix ?"]
    : main.questions.slice(0, 3);

  return [
    intro,
    "### Approche de principe",
    steps.map((s) => `- ${s}`).join("\n"),
    "### Briques envisagées",
    bricks.map((b) => `- ${b}`).join("\n"),
    "### Points à préciser",
    questions.map((q) => `- ${q}`).join("\n"),
    "_Réponse de principe, sans engagement : un expert ZirconAI valide toute proposition, son périmètre et son budget._",
  ].join("\n\n");
}

/* ------------------------------------------------------------------ */

type SubmitState = { phase: "idle" | "form" | "sending" | "done" | "login"; error?: string; id?: number };

function loadDraft(): Message[] | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 1 ? parsed : null;
  } catch { return null; }
}

export default function ProjectAdvisor({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [submit, setSubmit] = useState<SubmitState>({ phase: "idle" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const draft = loadDraft();
    if (draft) { setMessages(draft); setSubmit({ phase: isLoggedIn() ? "form" : "idle" }); }
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    const onKey = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, streaming, submit.phase]);

  async function ask(history: Message[]): Promise<Message> {
    if (API) {
      try {
        const response = await fetch(`${API}/api/assistant/project/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: history[history.length - 1].content,
            history: history.slice(0, -1).slice(-8).map(({ role, content }) => ({ role, content })),
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (typeof data.answer === "string" && data.answer.trim()) return { role: "assistant", content: data.answer, source: "ai" };
        }
      } catch { /* bascule sur l'analyse guidée */ }
    }
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));
    return { role: "assistant", content: guidedAnalysis(history), source: "guided" };
  }

  async function streamIn(reply: Message) {
    const words = reply.content.split(/(\s+)/);
    for (let i = 0; i <= words.length; i += 3) {
      setStreaming(words.slice(0, i).join(""));
      await new Promise((r) => setTimeout(r, 18));
    }
    setStreaming(null);
    setMessages((m) => [...m, reply]);
  }

  async function send(text: string) {
    const content = text.trim().slice(0, 3000);
    if (!content || thinking || streaming !== null) return;
    const history: Message[] = [...messages, { role: "user", content }];
    setMessages(history);
    setInput("");
    if (submit.phase !== "done") setSubmit({ phase: "idle" });
    setThinking(true);
    const reply = await ask(history);
    setThinking(false);
    await streamIn(reply);
  }

  function onSubmit(e: FormEvent) { e.preventDefault(); send(input); }
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  function reset() {
    setMessages([{ role: "assistant", content: GREETING }]); setInput(""); setSubmit({ phase: "idle" });
    try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }

  function startSubmit() {
    if (isLoggedIn()) { setSubmit({ phase: "form" }); return; }
    setSubmit({ phase: "login" });
  }

  function goLogin() {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(messages)); } catch { /* ignore */ }
    window.location.href = `/connexion?next=${encodeURIComponent("/#projet")}`;
  }

  async function sendProposal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const userTurns = messages.filter((m) => m.role === "user");
    const lastAnalysis = [...messages].reverse().find((m) => m.role === "assistant" && m !== messages[0]);
    setSubmit({ phase: "sending" });
    try {
      const response = await authFetch("/api/project-proposals/", {
        method: "POST",
        body: JSON.stringify({
          title: String(form.get("title") ?? "").trim(),
          company: String(form.get("company") ?? "").trim(),
          need: userTurns.map((m) => m.content).join("\n\n").slice(0, 3000),
          analysis: (lastAnalysis?.content ?? "").slice(0, 8000),
          analysis_source: lastAnalysis?.source === "ai" ? "ai" : "guided",
          conversation: messages.slice(1).slice(-20).map(({ role, content }) => ({ role, content: content.slice(0, 8000) })),
          consent: form.get("consent") === "on",
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) { setSubmit({ phase: "login" }); return; }
      if (!response.ok) {
        const detail = data.detail || Object.values(data).flat().join(" ") || "La proposition n'a pas pu être envoyée.";
        throw new Error(String(detail));
      }
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setSubmit({ phase: "done", id: data.id });
    } catch (err) {
      setSubmit({ phase: "form", error: err instanceof Error ? err.message : "Erreur inattendue." });
    }
  }

  const userTurns = messages.filter((m) => m.role === "user");
  const userCount = userTurns.length;
  const firstNeed = (userTurns[0]?.content ?? "").replace(/\s+/g, " ").trim();
  const firstSentence = firstNeed.split(/(?<=[.!?])\s/)[0];
  const defaultTitle = firstSentence.length <= 70 ? firstSentence : firstSentence.slice(0, 70).replace(/\s+\S*$/, "") + "…";
  const brief = messages.slice(1).map((m) => `${m.role === "user" ? "Moi" : "Conseiller ZirconAI"} :\n${m.content.replace(/[#*_]/g, "")}`).join("\n\n");
  const mailto = `mailto:contact@zirconai.fr?subject=${encodeURIComponent("Nouveau projet — brief ProjectAcademy")}&body=${encodeURIComponent(("Bonjour,\n\nVoici le brief de mon projet, préparé avec le conseiller IA :\n\n" + brief).slice(0, 1800))}`;
  const busy = thinking || streaming !== null;

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <section className="advisor" role="dialog" aria-modal="true" aria-labelledby="advisor-title">
        <header className="advisor-head">
          <div className="advisor-avatar" aria-hidden="true"><span /></div>
          <div>
            <h2 id="advisor-title">Conseiller projet ZirconAI</h2>
            <small><span className="zx-dot" /> En ligne · analyse de votre besoin en direct</small>
          </div>
          <div className="advisor-head-actions">
            {userCount > 0 && <button type="button" onClick={reset} disabled={busy}>Recommencer</button>}
            <button type="button" className="advisor-close" onClick={onClose} aria-label="Fermer">×</button>
          </div>
        </header>

        <div className="advisor-stream" ref={scrollRef} aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`advisor-msg ${m.role}`}>
              {m.role === "assistant" && <span className="advisor-mini" aria-hidden="true" />}
              <div className="advisor-bubble"><RichText text={m.content} /></div>
            </div>
          ))}
          {thinking && (
            <div className="advisor-msg assistant">
              <span className="advisor-mini" aria-hidden="true" />
              <div className="advisor-bubble advisor-thinking"><span /><span /><span /><em>Analyse de votre besoin…</em></div>
            </div>
          )}
          {streaming !== null && (
            <div className="advisor-msg assistant">
              <span className="advisor-mini" aria-hidden="true" />
              <div className="advisor-bubble"><RichText text={streaming} /><i className="zx-caret" /></div>
            </div>
          )}
          {userCount === 0 && !busy && (
            <div className="advisor-suggestions">
              <span>Exemples de besoins</span>
              {SUGGESTIONS.map((s) => <button type="button" key={s} onClick={() => send(s)}>{s}</button>)}
            </div>
          )}

          {userCount > 0 && !busy && submit.phase === "idle" && (
            <div className="advisor-next">
              <button type="button" className="zx-btn zx-btn-primary" onClick={startSubmit}>Soumettre ma proposition <span aria-hidden="true">→</span></button>
              <small>Vous pouvez aussi continuer à préciser votre besoin ci-dessous.</small>
            </div>
          )}

          {submit.phase === "login" && (
            <div className="advisor-card">
              <h5>Une dernière étape</h5>
              <p>Connectez-vous ou créez votre compte pour envoyer votre proposition et <strong>suivre sa réponse</strong> dans votre espace personnel. Votre échange est conservé.</p>
              <div className="advisor-card-actions">
                <button type="button" className="zx-btn zx-btn-primary" onClick={goLogin}>Se connecter / créer un compte <span aria-hidden="true">→</span></button>
                <a className="zx-btn zx-btn-ghost" href={mailto}>Envoyer plutôt par email</a>
              </div>
            </div>
          )}

          {(submit.phase === "form" || submit.phase === "sending") && (
            <form className="advisor-card registration-form" onSubmit={sendProposal}>
              <h5>Votre proposition de projet</h5>
              <p>Elle sera transmise à l&apos;équipe ZirconAI avec votre échange et l&apos;analyse de principe. Vous suivrez son statut dans votre espace personnel.</p>
              <div className="form-grid">
                <label>Titre du projet<input name="title" required minLength={3} maxLength={150} defaultValue={defaultTitle} /></label>
                <label>Entreprise (facultatif)<input name="company" maxLength={150} autoComplete="organization" /></label>
              </div>
              <label className="consent"><input type="checkbox" name="consent" required /> J&apos;accepte que ZirconAI utilise ces informations pour étudier mon projet et me recontacter.</label>
              {submit.error && <div className="form-feedback error" role="alert">{submit.error}</div>}
              <div className="advisor-card-actions">
                <button className="zx-btn zx-btn-primary" disabled={submit.phase === "sending"}>{submit.phase === "sending" ? "Envoi en cours…" : "Envoyer ma proposition →"}</button>
                <button type="button" className="zx-btn zx-btn-ghost" onClick={() => setSubmit({ phase: "idle" })}>Annuler</button>
              </div>
            </form>
          )}

          {submit.phase === "done" && (
            <div className="advisor-card done">
              <h5>✓ Proposition envoyée</h5>
              <p>L&apos;équipe ZirconAI va l&apos;étudier. Vous retrouvez son statut et nos réponses dans votre espace personnel.</p>
              <div className="advisor-card-actions">
                <a className="zx-btn zx-btn-primary" href="/espace-apprenant#projets">Suivre ma proposition <span aria-hidden="true">→</span></a>
                <button type="button" className="zx-btn zx-btn-ghost" onClick={reset}>Nouveau projet</button>
              </div>
            </div>
          )}
        </div>

        <form className="advisor-composer" onSubmit={onSubmit}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={3000}
            placeholder={userCount ? "Répondez ou précisez votre besoin…" : "Ex. : nous voulons automatiser le traitement de nos factures fournisseurs…"}
            aria-label="Décrivez votre projet"
            disabled={submit.phase === "done"}
          />
          <button type="submit" disabled={!input.trim() || busy || submit.phase === "done"} aria-label="Envoyer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg>
          </button>
        </form>
        <p className="advisor-legal">Réponse de principe générée automatiquement, sans engagement. Ne partagez pas d&apos;informations confidentielles.</p>
      </section>
    </div>
  );
}
