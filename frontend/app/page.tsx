"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import ProjectAdvisor from "./ProjectAdvisor";
import ShieldStamp from "./ShieldStamp";

type Product = {
  name: string;
  category: string;
  description: string;
  modules: string[];
  status: "available" | "coming";
  url?: string;
  symbol: string;
};

type Training = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  modules: string[];
  atmosphere: "cyber" | "future";
};

const products: Product[] = [
  {
    name: "Smart Tower Project",
    category: "Project intelligence",
    description: "Une tour de contrôle digitale pour centraliser le pilotage des projets, suivre les indicateurs et rendre les décisions plus lisibles.",
    modules: ["Portefeuille et suivi des projets", "Tableaux de bord et KPI", "Risques, actions et alertes", "Collaboration et reporting"],
    status: "available",
    url: "https://www.smarttowerproject.zirconai.fr/",
    symbol: "◈",
  },
  {
    name: "GrowthAI",
    category: "AI-powered growth",
    description: "Une plateforme d'aide à la prospection et au développement commercial, pensée pour structurer les campagnes et mieux suivre les opportunités.",
    modules: ["Campagnes de prospection", "Qualification des leads", "Assistant de rédaction", "Suivi des performances"],
    status: "available",
    url: "https://www.growthai.zirconai.fr/",
    symbol: "✳",
  },
  {
    name: "ZirconShield AI",
    category: "Cybersecurity & AI governance",
    description: "Un futur espace de pilotage de la sécurité, des risques et de la gouvernance des usages de l'intelligence artificielle.",
    modules: ["Registre des risques", "Contrôles et conformité", "Surveillance des usages IA", "Plans de remédiation"],
    status: "coming",
    symbol: "⬡",
  },
  {
    name: "Docyra AI",
    category: "Intelligent document management",
    description: "Une GED intelligente en préparation pour organiser, extraire, classer et retrouver les documents métier.",
    modules: ["Capture et OCR", "Classification intelligente", "Recherche documentaire", "Workflows et traçabilité"],
    status: "coming",
    symbol: "▤",
  },
  {
    name: "StockPilot AI",
    category: "Inventory & provisioning",
    description: "Une solution en préparation pour suivre les stocks, anticiper les besoins et fluidifier les approvisionnements.",
    modules: ["Stocks multi-sites", "Approvisionnement", "Alertes de seuil", "Prévisions et mouvements"],
    status: "coming",
    symbol: "▦",
  },
  {
    name: "ZirconAcademy AI",
    category: "Smart learning",
    description: "Un environnement d'apprentissage intelligent en préparation : parcours personnalisés, évaluations et suivi des compétences.",
    modules: ["Parcours adaptatifs", "Évaluations", "Suivi des compétences", "Assistant pédagogique"],
    status: "coming",
    symbol: "✧",
  },
];

const trainings: Training[] = [
  {
    id: "cyber-defense",
    eyebrow: "FORMATION GRATUITE · 4 HEURES",
    title: "AI Cyber Defense",
    subtitle: "Cybersécurité, IA et protection",
    description: "Comprendre les menaces actuelles, les risques introduits par l'IA et les premières mesures de protection des données et des environnements numériques.",
    modules: ["Panorama de la cybersécurité", "Menaces modernes et ingénierie sociale", "Prompt injection et risques liés aux LLM", "Protection des données et contrôle des accès", "Bonnes pratiques et plan d'action"],
    atmosphere: "cyber",
  },
  {
    id: "ai-architecture",
    eyebrow: "FORMATION GRATUITE · 4 HEURES",
    title: "AI Future Architect",
    subtitle: "Comprendre, utiliser et concevoir l'IA",
    description: "Découvrir les modèles d'IA, comprendre leurs différences et apprendre à assembler les briques d'une architecture IA moderne.",
    modules: ["IA générative et cas d'usage", "LLM : concepts et limites", "Panorama des modèles et fournisseurs", "API, RAG et agents IA", "Architecture de référence et atelier de conception"],
    atmosphere: "future",
  },
];

const faq: Record<string, string> = {
  beginner: "Oui. La session est conçue pour rendre les notions accessibles. Les exemples seront expliqués progressivement ; aucune expertise avancée n'est nécessaire pour suivre la découverte.",
  duration: "Chaque formation dure 4 heures. Le programme détaillé est affiché dans la fiche de la session choisie.",
  date: "Les formations sont prévues les dimanches de février 2027. La date et les modalités exactes de votre session seront confirmées par email ; l'inscription ne vaut pas confirmation d'une date précise.",
  price: "La participation à ces deux sessions de découverte est gratuite.",
  certificate: "Cette session est une formation de sensibilisation et de découverte. Aucun diplôme ou certification professionnelle n'est promis dans le cadre de cette inscription.",
  fallback: "Je ne dispose pas d'une information validée pour répondre avec certitude. Je préfère ne pas vous induire en erreur. Laissez votre question dans le formulaire et l'équipe ZirconAI pourra vous répondre.",
};

export default function Home() {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activeTraining, setActiveTraining] = useState<Training | null>(null);
  const [interestProduct, setInterestProduct] = useState<Product | null>(null);
  const [assistantAnswer, setAssistantAnswer] = useState(faq.fallback);
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [advisorOpen, setAdvisorOpen] = useState(false);
  const closeAdvisor = useCallback(() => {
    setAdvisorOpen(false);
    if (window.location.hash === "#projet") history.replaceState(null, "", window.location.pathname);
  }, []);

  useEffect(() => {
    const openFromHash = () => { if (window.location.hash === "#projet") setAdvisorOpen(true); };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const items = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); observer?.unobserve(e.target); } }), { threshold: 0.12 })
      : null;
    items.forEach((el) => (observer ? observer.observe(el) : el.classList.add("in")));
    const onMove = (event: PointerEvent) => {
      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(".zx-spot");
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("hashchange", openFromHash); window.removeEventListener("scroll", onScroll); document.removeEventListener("pointermove", onMove); observer?.disconnect(); };
  }, []);

  const availableProducts = useMemo(() => products.filter((p) => p.status === "available"), []);

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("sending");
    setFormMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      training: activeTraining?.id,
      full_name: String(form.get("full_name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      company: String(form.get("company") ?? "").trim(),
      experience: String(form.get("experience") ?? "beginner"),
      question: String(form.get("question") ?? "").trim(),
      consent: form.get("consent") === "on",
    };
    try {
      const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "").replace(/\/api$/, "");
      if (!base) throw new Error("Le service d'inscription n'est pas encore configuré. Merci de réessayer ultérieurement.");
      const response = await fetch(`${base}/api/registrations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(typeof window !== "undefined" && sessionStorage.getItem("projectacademy_access") ? { Authorization: "Bearer " + sessionStorage.getItem("projectacademy_access") } : {}) },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Votre demande n'a pas pu être enregistrée.");
      setFormState("success");
      setFormMessage("Votre demande a bien été enregistrée. L'équipe ZirconAI vous contactera par email pour confirmer la date de votre session.");
      formElement.reset();
    } catch (error) {
      setFormState("error");
      setFormMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  }

  async function submitInterest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormState("sending");
    setFormMessage("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const payload = {
      product: interestProduct?.name,
      full_name: String(form.get("full_name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      consent: form.get("consent") === "on",
    };
    try {
      const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "").replace(/\/api$/, "");
      if (!base) throw new Error("Le service de contact n'est pas encore configuré.");
      const response = await fetch(`${base}/api/product-interests/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(sessionStorage.getItem("projectacademy_access") ? { Authorization: "Bearer " + sessionStorage.getItem("projectacademy_access") } : {}) },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Votre demande n'a pas pu être enregistrée.");
      setFormState("success");
      setFormMessage("Merci ! Votre intérêt est enregistré. Nous vous informerons lorsque cette solution approchera de son lancement.");
      formElement.reset();
    } catch (error) {
      setFormState("error");
      setFormMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  }

  function closeModals() {
    setActiveProduct(null);
    setActiveTraining(null);
    setInterestProduct(null);
    setFormState("idle");
    setFormMessage("");
  }

  return (
    <main className="zx">
      <div className="zx-aurora" aria-hidden="true"><span /><span /><span /></div>
      <div className="zx-noise" aria-hidden="true" />

      <header className={scrolled ? "zx-header is-scrolled" : "zx-header"}>
        <a href="#home" className="zx-brand" aria-label="ProjectAcademy, accueil">
          <span className="zx-logo"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2 29 9.5v13L16 30 3 22.5v-13Z" /><path d="M10 11h12l-12 10h12" /></svg></span>
          <span className="zx-brand-text">Zircon<b>AI</b><small>Project Academy</small></span>
        </a>
        <nav className={mobileMenu ? "zx-nav open" : "zx-nav"}>
          {[["#expertise", "Expertises"], ["#solutions", "Solutions"], ["#formations", "Formations"], ["#method", "Méthode"], ["#contact", "Contact"]].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMobileMenu(false)}>{label}</a>
          ))}
          <a href="/connexion" className="zx-nav-cta" onClick={() => setMobileMenu(false)}><span className="zx-dot" /> Espace membre</a>
        </nav>
        <button className="zx-burger" aria-label="Ouvrir le menu" aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}><span /><span /></button>
      </header>

      <section className="zx-hero" id="home">
        <div className="zx-grid-floor" aria-hidden="true" />
        <ShieldStamp />
        <div className="zx-hero-copy reveal">
          <div className="zx-chip"><span className="zx-dot" /> Inscriptions ouvertes<span className="zx-chip-more"> · Février 2027</span></div>
          <h1>L&apos;intelligence<br /><span className="zx-gradient-text">qui prend de l&apos;avance.</span></h1>
          <p className="zx-lead">Architectures IA, cybersécurité et SaaS intelligents. ZirconAI transforme les idées en systèmes concrets, et ProjectAcademy vous forme gratuitement pour les maîtriser.</p>
          <div className="zx-actions">
            <a href="#formations" className="zx-btn zx-btn-primary">Réserver ma formation gratuite <span aria-hidden="true">→</span></a>
            <a href="#solutions" className="zx-btn zx-btn-ghost">Explorer l&apos;écosystème</a>
            <button type="button" className="zx-btn zx-btn-ai" onClick={() => setAdvisorOpen(true)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" /><circle cx="12" cy="12" r="3" /></svg> Démarrer un nouveau projet</button>
          </div>
          <dl className="zx-stats">
            <div><dt>6</dt><dd>solutions SaaS</dd></div>
            <div><dt>2</dt><dd>formations gratuites</dd></div>
            <div><dt>4h</dt><dd>par session</dd></div>
          </dl>
        </div>

        <div className="zx-hero-visual reveal" aria-hidden="true">
          <div className="zx-core">
            <div className="zx-ring r1" /><div className="zx-ring r2" /><div className="zx-ring r3" />
            <div className="zx-crystal"><svg viewBox="0 0 100 100"><defs><linearGradient id="zg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#67e8f9" /><stop offset=".5" stopColor="#818cf8" /><stop offset="1" stopColor="#c084fc" /></linearGradient></defs><path d="M50 4 92 28v44L50 96 8 72V28Z" fill="none" stroke="url(#zg)" strokeWidth="2" /><path d="M50 4v92M8 28l84 44M92 28 8 72" stroke="url(#zg)" strokeWidth=".6" opacity=".5" /><path d="M34 38h32L34 62h32" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <i className="zx-node n1" /><i className="zx-node n2" /><i className="zx-node n3" /><i className="zx-node n4" />
          </div>
          <div className="zx-term">
            <div className="zx-term-bar"><i /><i /><i /><span>zircon://core</span></div>
            <pre><span className="c">$</span> zircon init --academy{"\n"}<span className="ok">✓</span> modèles LLM chargés{"\n"}<span className="ok">✓</span> garde-fous sécurité actifs{"\n"}<span className="ok">✓</span> 2 parcours prêts<span className="zx-caret" /></pre>
          </div>
          <div className="zx-float-card fc1"><span className="zx-dot" /> AI SYSTEMS · ONLINE</div>
          <div className="zx-float-card fc2"><b>0 €</b><small>formations gratuites</small></div>
        </div>
      </section>

      <div className="zx-marquee" aria-hidden="true">
        <div>{[...Array(2)].map((_, k) => <span key={k}>LLM ◆ RAG ◆ AGENTS IA ◆ CYBERSÉCURITÉ ◆ ZERO TRUST ◆ ARCHITECTURE CLOUD ◆ SAAS ◆ DATA ◆ GOUVERNANCE IA ◆ </span>)}</div>
      </div>

      <section className="zx-section" id="expertise">
        <div className="zx-split">
          <div className="reveal">
            <div className="zx-kicker"><span>01</span> Qui sommes-nous</div>
            <h2>La technologie doit servir <span className="zx-gradient-text">l&apos;ambition.</span></h2>
            <p className="zx-muted">ZirconAI accompagne les entreprises dans la conception de solutions numériques de nouvelle génération : architecture logicielle, intelligence artificielle, cybersécurité et plateformes SaaS.</p>
          </div>
          <div className="zx-expertise">
            {[
              ["AI & Architecture", "LLM, RAG, agents et intégration applicative", "M12 2a4 4 0 0 1 4 4v1a3 3 0 0 1 3 3v1a3 3 0 0 1-1 2.2V15a3 3 0 0 1-3 3h-1v4h-4v-4H9a3 3 0 0 1-3-3v-1.8A3 3 0 0 1 5 11v-1a3 3 0 0 1 3-3V6a4 4 0 0 1 4-4Z"],
              ["Cybersecurity", "Protection des données et maîtrise des risques", "M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Z"],
              ["Intelligent SaaS", "Produits métier, automatisation et expérience utilisateur", "M3 4h18v12H3zM8 20h8M12 16v4"],
            ].map(([title, text, d], i) => (
              <article key={title} className="zx-glass zx-spot reveal" style={{ transitionDelay: `${i * 90}ms` }}>
                <span className="zx-icon"><svg viewBox="0 0 24 24"><path d={d} /></svg></span>
                <div><b>{title}</b><small>{text}</small></div>
                <span className="zx-idx">0{i + 1}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="zx-section" id="solutions">
        <div className="zx-heading reveal">
          <div><div className="zx-kicker"><span>02</span> Notre écosystème</div><h2>Des solutions pensées <span className="zx-gradient-text">pour aller plus loin.</span></h2></div>
          <p className="zx-muted">Deux plateformes disponibles dès aujourd&apos;hui, quatre autres en préparation dans nos labs.</p>
        </div>
        <div className="zx-bento">
          {products.map((product, index) => (
            <article className={`zx-product zx-glass zx-spot reveal ${product.status === "available" ? "is-live" : "is-coming"}`} key={product.name} style={{ transitionDelay: `${(index % 3) * 80}ms` }}>
              <div className="zx-product-top">
                <span className="zx-emblem">{product.symbol}</span>
                <span className={product.status === "available" ? "zx-badge live" : "zx-badge"}>{product.status === "available" ? <><span className="zx-dot" /> Disponible</> : "Bientôt"}</span>
              </div>
              <div className="zx-cat">{product.category}</div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <ul className="zx-mini-tags">{product.modules.slice(0, 3).map((m) => <li key={m}>{m}</li>)}</ul>
              <button className="zx-link" onClick={() => setActiveProduct(product)}>{product.status === "available" ? "Découvrir la solution" : "Découvrir le projet"} <span aria-hidden="true">→</span></button>
            </article>
          ))}
        </div>
        <div className="zx-direct reveal">
          <span>Accès direct</span>
          {availableProducts.map((product) => <a href={product.url} target="_blank" rel="noreferrer" key={product.name}>{product.name} ↗</a>)}
        </div>
      </section>

      <section className="zx-section" id="formations">
        <div className="zx-heading reveal">
          <div><div className="zx-kicker"><span>03</span> ProjectAcademy</div><h2>Le futur se construit <span className="zx-gradient-text">en apprenant.</span></h2></div>
          <p className="zx-muted">Deux formations gratuites de 4 heures pour comprendre l&apos;IA et la cybersécurité par la pratique.</p>
        </div>
        <div className="zx-trainings">
          {trainings.map((training, index) => (
            <article className={`zx-training zx-spot reveal ${training.atmosphere}`} key={training.id} style={{ transitionDelay: `${index * 120}ms` }}>
              <div className="zx-training-art" aria-hidden="true">
                {training.atmosphere === "cyber" ? (
                  <>
                    <div className="zx-code-rain">{Array.from({ length: 14 }, (_, i) => <span key={i} style={{ left: `${i * 7.3}%`, animationDelay: `${(i * 0.37) % 3}s` }}>{"10110 01101 11010 00111 10010 01011".slice(i % 6)}</span>)}</div>
                    <svg className="zx-shield" viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
                    <div className="zx-scan" />
                  </>
                ) : (
                  <>
                    <svg className="zx-net" viewBox="0 0 300 160">{[[40, 30], [40, 80], [40, 130], [150, 50], [150, 110], [260, 80]].map(([x, y], i, arr) => (
                      <g key={i}>{i < 3 && [3, 4].map((j) => <line key={j} x1={x} y1={y} x2={arr[j][0]} y2={arr[j][1]} />)}{(i === 3 || i === 4) && <line x1={x} y1={y} x2={260} y2={80} />}<circle cx={x} cy={y} r={i === 5 ? 9 : 6} /></g>
                    ))}</svg>
                  </>
                )}
                <span className="zx-training-num">0{index + 1}</span>
                <span className="zx-art-label">{training.atmosphere === "cyber" ? "SECURITY PROTOCOL · ACTIVE" : "NEURAL ARCHITECTURE · v2"}</span>
              </div>
              <div className="zx-training-body">
                <div className="zx-eyebrow">{training.eyebrow}</div>
                <h3>{training.title}</h3>
                <h4>{training.subtitle}</h4>
                <p>{training.description}</p>
                <ol className="zx-modules">{training.modules.map((m, i) => <li key={m}><span>{String(i + 1).padStart(2, "0")}</span>{m}</li>)}</ol>
                <div className="zx-tags"><span>Dimanche</span><span>Février 2027</span><span>Gratuit</span><span>Modalités confirmées par email</span></div>
                <button className="zx-btn zx-btn-primary" onClick={() => { setActiveTraining(training); setAssistantAnswer(faq.fallback); }}>Voir le programme & s&apos;inscrire <span aria-hidden="true">→</span></button>
              </div>
            </article>
          ))}
        </div>
        <p className="zx-note">Durée : 4 heures · Participation gratuite · Sessions prévues les dimanches de février 2027. La date exacte et les modalités sont confirmées par email après réception de la demande.</p>
      </section>

      <section className="zx-section" id="method">
        <div className="zx-kicker reveal"><span>04</span> Notre méthode</div>
        <h2 className="reveal">De l&apos;idée à l&apos;impact. <span className="zx-gradient-text">Avec méthode.</span></h2>
        <div className="zx-timeline">
          {[["Comprendre", "Identifier les enjeux, les utilisateurs et les objectifs métier."], ["Concevoir", "Définir une architecture robuste, sécurisée et évolutive."], ["Déployer", "Construire, tester et intégrer des solutions utiles."], ["Transmettre", "Former les équipes et favoriser l'autonomie durable."]].map(([t, d], i) => (
            <div key={t} className="zx-step reveal" style={{ transitionDelay: `${i * 100}ms` }}><span className="zx-step-dot">{String(i + 1).padStart(2, "0")}</span><b>{t}</b><p>{d}</p></div>
          ))}
        </div>
      </section>

      <section className="zx-section zx-cta-wrap" id="contact">
        <div className="zx-cta reveal">
          <div className="zx-cta-glow" aria-hidden="true" />
          <div className="zx-kicker"><span>05</span> Construisons ensemble</div>
          <h2>Votre prochain projet <span className="zx-gradient-text">commence ici.</span></h2>
          <p className="zx-muted">Parlons de vos enjeux en intelligence artificielle, architecture, cybersécurité ou transformation numérique.</p>
          <div className="zx-actions center">
            <a className="zx-btn zx-btn-primary" href="mailto:contact@zirconai.fr">Contacter ZirconAI <span aria-hidden="true">→</span></a>
<button type="button" className="zx-btn zx-btn-ai" onClick={() => setAdvisorOpen(true)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2" /><circle cx="12" cy="12" r="3" /></svg> Démarrer un nouveau projet</button>
            <a className="zx-btn zx-btn-ghost" href="#formations">Voir les formations</a>
          </div>
        </div>
      </section>

      <footer className="zx-footer">
        <a href="#home" className="zx-brand"><span className="zx-logo"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2 29 9.5v13L16 30 3 22.5v-13Z" /><path d="M10 11h12l-12 10h12" /></svg></span><span className="zx-brand-text">Zircon<b>AI</b><small>Project Academy</small></span></a>
        <span>© {new Date().getFullYear()} ZirconAI · Paris, France</span>
        <a href="mailto:contact@zirconai.fr">contact@zirconai.fr</a>
      </footer>

      <ProjectAdvisor open={advisorOpen} onClose={closeAdvisor} />

      {(activeProduct || activeTraining || interestProduct) && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModals(); }}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-label="Détails et inscription">
            <button className="modal-close" onClick={closeModals} aria-label="Fermer">×</button>
            {activeProduct && (
              <>
                <div className="zx-kicker">ZirconAI · Solution</div>
                <div className="modal-emblem">{activeProduct.symbol}</div>
                <div className="zx-cat">{activeProduct.category}</div>
                <h2>{activeProduct.name}</h2>
                <span className={activeProduct.status === "available" ? "zx-badge live" : "zx-badge"}>{activeProduct.status === "available" ? <><span className="zx-dot" /> Disponible</> : "Disponible prochainement"}</span>
                <p>{activeProduct.description}</p>
                <h4>Modules et fonctionnalités</h4>
                <ul className="module-list">{activeProduct.modules.map((module) => <li key={module}>{module}</li>)}</ul>
                {activeProduct.status === "available" && activeProduct.url ? <a className="zx-btn zx-btn-primary" href={activeProduct.url} target="_blank" rel="noreferrer">Accéder au produit ↗</a> : <button className="zx-btn zx-btn-primary" onClick={() => { setInterestProduct(activeProduct); setActiveProduct(null); setFormState("idle"); }}>Être informé du lancement →</button>}
              </>
            )}
            {activeTraining && (
              <>
                <div className="zx-kicker">ProjectAcademy · Formation gratuite</div>
                <div className={`modal-training-visual ${activeTraining.atmosphere}`}>{activeTraining.atmosphere === "cyber" ? "⌘ CYBER DEFENSE · MODULE" : "✧ AI FUTURE ARCHITECTURE · MODULE"}</div>
                <div className="zx-eyebrow">{activeTraining.eyebrow} · DIMANCHES DE FÉVRIER 2027</div>
                <h2>{activeTraining.title}</h2>
                <h4>{activeTraining.subtitle}</h4>
                <p>{activeTraining.description}</p>
                <h4>Programme pédagogique</h4>
                <ul className="module-list">{activeTraining.modules.map((module) => <li key={module}>{module}</li>)}</ul>
                <div className="assistant-box">
                  <div className="assistant-header"><span className="assistant-avatar">✧</span><div><b>Assistant ProjectAcademy</b><small>Informations vérifiées · réponse guidée</small></div></div>
                  <p>{assistantAnswer}</p>
                  <div className="faq-actions">
                    <button onClick={() => setAssistantAnswer(faq.beginner)}>Débutant accepté ?</button>
                    <button onClick={() => setAssistantAnswer(faq.duration)}>Quelle durée ?</button>
                    <button onClick={() => setAssistantAnswer(faq.date)}>Quelle date ?</button>
                    <button onClick={() => setAssistantAnswer(faq.price)}>C&apos;est gratuit ?</button>
                    <button onClick={() => setAssistantAnswer(faq.certificate)}>Diplôme délivré ?</button>
                  </div>
                </div>
                {formState === "success" ? <div className="form-feedback success">{formMessage}</div> : (
                  <form className="registration-form" onSubmit={submitRegistration}>
                    <h4>Demander votre inscription</h4>
                    <div className="form-grid">
                      <label>Nom et prénom<input name="full_name" required minLength={2} maxLength={150} autoComplete="name" /></label>
                      <label>Email professionnel ou personnel<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
                      <label>Entreprise (facultatif)<input name="company" maxLength={150} autoComplete="organization" /></label>
                      <label>Votre niveau<select name="experience" defaultValue="beginner"><option value="beginner">Débutant</option><option value="intermediate">Intermédiaire</option><option value="advanced">Avancé</option></select></label>
                    </div>
                    <label>Une question à nous poser ? (facultatif)<textarea name="question" rows={2} maxLength={1000} /></label>
                    <label className="consent"><input type="checkbox" name="consent" required /> J&apos;accepte que ZirconAI utilise ces informations pour traiter ma demande et me recontacter au sujet de cette formation. <a href="mailto:contact@zirconai.fr?subject=Confidentialit%C3%A9%20ProjectAcademy">En savoir plus</a>.</label>
                    {formMessage && <div className="form-feedback error">{formMessage}</div>}
                    <button className="zx-btn zx-btn-primary" disabled={formState === "sending"}>{formState === "sending" ? "Envoi en cours…" : "Envoyer ma demande →"}</button>
                  </form>
                )}
                <p className="fine-print">Votre demande sera enregistrée sous réserve de disponibilité. La date, le créneau et le lien de participation seront confirmés par email. Aucun email automatique n&apos;est envoyé tant que le service de messagerie n&apos;est pas configuré.</p>
              </>
            )}
            {interestProduct && (
              <>
                <div className="zx-kicker">ZirconAI · Future release</div>
                <div className="modal-emblem">{interestProduct.symbol}</div>
                <h2>{interestProduct.name}</h2>
                <span className="zx-badge">Disponible prochainement</span>
                <p>Laissez-nous vos coordonnées si vous souhaitez être informé de l&apos;avancement et de la disponibilité de cette solution. Il ne s&apos;agit pas d&apos;une commande ni d&apos;une demande de démonstration.</p>
                {formState === "success" ? <div className="form-feedback success">{formMessage}</div> : (
                  <form className="registration-form" onSubmit={submitInterest}>
                    <label>Nom et prénom<input name="full_name" required minLength={2} maxLength={150} autoComplete="name" /></label>
                    <label>Email<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
                    <label className="consent"><input type="checkbox" name="consent" required /> J&apos;accepte d&apos;être recontacté au sujet du lancement de ce produit.</label>
                    {formMessage && <div className="form-feedback error">{formMessage}</div>}
                    <button className="zx-btn zx-btn-primary" disabled={formState === "sending"}>{formState === "sending" ? "Envoi…" : "Être informé du lancement →"}</button>
                  </form>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
