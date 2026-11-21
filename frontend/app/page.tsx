"use client";

import { FormEvent, useMemo, useState } from "react";

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
      const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
      if (!base) throw new Error("Le service d'inscription n'est pas encore configuré. Merci de réessayer ultérieurement.");
      const response = await fetch(`${base}/api/registrations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
      if (!base) throw new Error("Le service de contact n'est pas encore configuré.");
      const response = await fetch(`${base}/api/product-interests/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <main>
      <div className="top-line" />
      <header className="site-header">
        <a href="#home" className="brand" aria-label="ProjectAcademy, accueil">
          <span className="brand-mark">Z<span>◇</span></span>
          <span className="brand-name">ZIRCON<span>AI</span><small>PROJECT ACADEMY</small></span>
        </a>
        <button className="menu-toggle" aria-label="Ouvrir le menu" onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
        <nav className={mobileMenu ? "navigation open" : "navigation"}>
          <a href="#expertise" onClick={() => setMobileMenu(false)}>Expertises</a>
          <a href="#solutions" onClick={() => setMobileMenu(false)}>Solutions SaaS</a>
          <a href="#formations" onClick={() => setMobileMenu(false)}>Formations</a>
          <a href="#method" onClick={() => setMobileMenu(false)}>Notre méthode</a>
          <a href="/connexion" className="nav-cta" onClick={() => setMobileMenu(false)}>Espace membre ↗</a>
          <a href="#contact" onClick={() => setMobileMenu(false)}>Contact</a>
        </nav>
      </header>

      <section className="hero" id="home">
        <div className="hero-grid" />
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse-dot" /> ZIRCONAI · INTELLIGENCE EN ACTION</div>
          <h1>Donner à l&apos;innovation<br /><em>une longueur d&apos;avance.</em></h1>
          <p className="hero-lead">Nous concevons des architectures intelligentes, sécurisons les usages de l&apos;IA et créons des SaaS qui transforment les idées en solutions concrètes.</p>
          <div className="hero-actions">
            <a href="#formations" className="button button-gold">Découvrir les formations <span>↗</span></a>
            <a href="#solutions" className="button button-ghost">Explorer nos solutions</a>
          </div>
          <div className="hero-meta"><span>01 — AI & ARCHITECTURE</span><span>02 — CYBERSECURITY</span><span>03 — INTELLIGENT SAAS</span></div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
          <div className="crystal"><div className="crystal-core">Z</div></div>
          <div className="visual-label label-top">AI / SYSTEMS <b>● ONLINE</b></div>
          <div className="visual-label label-bottom">INTELLIGENCE<br /><strong>WITHOUT LIMITS</strong></div>
          <span className="float-node node-a" /><span className="float-node node-b" /><span className="float-node node-c" />
        </div>
        <div className="hero-bottom"><span>SCROLL TO EXPLORE ↓</span><span>PARIS · FRANCE</span></div>
      </section>

      <section className="intro section-wrap" id="expertise">
        <div className="section-kicker">01 / QUI SOMMES-NOUS</div>
        <div className="intro-layout">
          <h2>La technologie doit<br />servir <em>l&apos;ambition.</em></h2>
          <div className="intro-copy">
            <p>ZirconAI accompagne les entreprises dans la conception de solutions numériques de nouvelle génération. Notre approche réunit architecture logicielle, intelligence artificielle, cybersécurité et développement de plateformes SaaS.</p>
            <div className="expertise-list">
              <div><span>01</span><b>AI & Architecture</b><small>LLM, RAG, agents et intégration applicative</small></div>
              <div><span>02</span><b>Cybersecurity</b><small>Protection des données et maîtrise des risques</small></div>
              <div><span>03</span><b>Intelligent SaaS</b><small>Produits métier, automatisation et expérience utilisateur</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="solutions-section section-wrap" id="solutions">
        <div className="section-heading">
          <div><div className="section-kicker">02 / NOTRE ÉCOSYSTÈME</div><h2>Des solutions pensées<br /><em>pour aller plus loin.</em></h2></div>
          <p>Des produits disponibles aujourd&apos;hui et de nouvelles plateformes en préparation.</p>
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <article className={`product-card ${product.status === "coming" ? "product-coming" : ""}`} key={product.name}>
              <div className="product-topline"><span>0{index + 1} / ZIRCONAI LABS</span><span className={product.status === "available" ? "status status-live" : "status"}>{product.status === "available" ? "DISPONIBLE" : "PROCHAINEMENT"}</span></div>
              <div className="product-emblem"><div className="emblem-ring" /><span>{product.symbol}</span><i /></div>
              <div className="product-category">{product.category}</div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <button className="text-link" onClick={() => setActiveProduct(product)}>{product.status === "available" ? "Découvrir la solution" : "Découvrir le projet"} <span>↗</span></button>
            </article>
          ))}
        </div>
        <div className="available-links">
          <span>ACCÈS DIRECT AUX PLATEFORMES</span>
          {availableProducts.map((product) => <a href={product.url} target="_blank" rel="noreferrer" key={product.name}>{product.name} ↗</a>)}
        </div>
      </section>

      <section className="training-section section-wrap" id="formations">
        <div className="section-heading training-heading">
          <div><div className="section-kicker">03 / PROJECTACADEMY</div><h2>Le futur se construit<br /><em>en apprenant.</em></h2></div>
          <p>Deux formations gratuites pour découvrir les enjeux de l&apos;IA et de la cybersécurité avec une approche concrète.</p>
        </div>
        <div className="training-grid">
          {trainings.map((training, index) => (
            <article className={`training-card ${training.atmosphere}`} key={training.id}>
              <div className="training-art">
                {training.atmosphere === "cyber" ? <><div className="matrix-rain">0101 1100 0011<br />1010 0110 1001<br />0011 1010 0101<br />1100 0010 1110<br />0101 1001 0110</div><div className="cyber-shield">⬡</div><div className="art-caption">SECURITY PROTOCOL / ACTIVE</div></> : <><div className="future-sun" /><div className="future-orbit" /><div className="future-person">◉</div><div className="future-certificate">✧<small>AI SKILLS</small></div><div className="art-caption">A NEW INTELLIGENCE ERA</div></>}
                <span className="training-number">0{index + 1}</span>
              </div>
              <div className="training-info">
                <div className="training-eyebrow">{training.eyebrow}</div>
                <h3>{training.title}</h3>
                <h4>{training.subtitle}</h4>
                <p>{training.description}</p>
                <div className="training-tags"><span>DIMANCHE</span><span>FÉVRIER 2027</span><span>EN LIGNE / MODALITÉS À CONFIRMER</span></div>
                <button className="button button-gold" onClick={() => { setActiveTraining(training); setAssistantAnswer(faq.fallback); }}>Voir le programme & s&apos;inscrire <span>↗</span></button>
              </div>
            </article>
          ))}
        </div>
        <p className="date-note">Durée : 4 heures · Participation gratuite · Les sessions sont prévues les dimanches de février 2027. La date exacte et les modalités seront confirmées par email après réception de la demande.</p>
      </section>

      <section className="method-section section-wrap" id="method">
        <div className="section-kicker">04 / NOTRE MÉTHODE</div>
        <h2>De l&apos;idée à l&apos;impact.<br /><em>Avec méthode.</em></h2>
        <div className="method-steps">
          <div><span>01</span><b>Comprendre</b><p>Identifier les enjeux, les utilisateurs et les objectifs métier.</p></div>
          <div><span>02</span><b>Concevoir</b><p>Définir une architecture robuste, sécurisée et évolutive.</p></div>
          <div><span>03</span><b>Déployer</b><p>Construire, tester et intégrer des solutions utiles.</p></div>
          <div><span>04</span><b>Transmettre</b><p>Former les équipes et favoriser l&apos;autonomie durable.</p></div>
        </div>
      </section>

      <section className="contact-section section-wrap" id="contact">
        <div className="contact-orb" />
        <div className="section-kicker">05 / CONSTRUISONS ENSEMBLE</div>
        <h2>Votre prochain projet<br /><em>commence ici.</em></h2>
        <p>Parlons de vos enjeux en intelligence artificielle, architecture, cybersécurité ou transformation numérique.</p>
        <a className="button button-gold" href="mailto:contact@zirconai.fr">Contacter ZirconAI <span>↗</span></a>
      </section>

      <footer className="site-footer">
        <a href="#home" className="brand"><span className="brand-mark">Z<span>◇</span></span><span className="brand-name">ZIRCON<span>AI</span><small>PROJECT ACADEMY</small></span></a>
        <span>© {new Date().getFullYear()} ZirconAI. Tous droits réservés.</span>
        <a href="mailto:contact@zirconai.fr">contact@zirconai.fr</a>
      </footer>

      <div className="human-badge"><span className="badge-orb">Z◇</span><small>HUMAN-CENTRIC<br />AI</small><b>Actif</b><i>● SÉCURITÉ & ÉTHIQUE</i></div>

      {(activeProduct || activeTraining || interestProduct) && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModals(); }}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-label="Détails et inscription">
            <button className="modal-close" onClick={closeModals} aria-label="Fermer">×</button>
            {activeProduct && (
              <>
                <div className="section-kicker">ZIRCONAI / SOLUTION</div>
                <div className="modal-emblem">{activeProduct.symbol}</div>
                <div className="product-category">{activeProduct.category}</div>
                <h2>{activeProduct.name}</h2>
                <span className={activeProduct.status === "available" ? "status status-live" : "status"}>{activeProduct.status === "available" ? "DISPONIBLE" : "DISPONIBLE PROCHAINEMENT"}</span>
                <p>{activeProduct.description}</p>
                <h4>Modules et fonctionnalités</h4>
                <ul className="module-list">{activeProduct.modules.map((module) => <li key={module}>{module}</li>)}</ul>
                {activeProduct.status === "available" && activeProduct.url ? <a className="button button-gold" href={activeProduct.url} target="_blank" rel="noreferrer">Accéder au produit ↗</a> : <button className="button button-gold" onClick={() => { setInterestProduct(activeProduct); setActiveProduct(null); setFormState("idle"); }}>Être informé du lancement ↗</button>}
              </>
            )}
            {activeTraining && (
              <>
                <div className="section-kicker">PROJECTACADEMY / FORMATION GRATUITE</div>
                <div className={`modal-training-visual ${activeTraining.atmosphere}`}>{activeTraining.atmosphere === "cyber" ? "⌘ MATRIX / CYBER DEFENSE" : "✧ AI / FUTURE ARCHITECTURE"}</div>
                <div className="training-eyebrow">{activeTraining.eyebrow} · DIMANCHES DE FÉVRIER 2027</div>
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
                    <button className="button button-gold" disabled={formState === "sending"}>{formState === "sending" ? "Envoi en cours…" : "Envoyer ma demande ↗"}</button>
                  </form>
                )}
                <p className="fine-print">Votre demande sera enregistrée sous réserve de disponibilité. La date, le créneau et le lien de participation seront confirmés par email. Aucun email automatique n&apos;est envoyé tant que le service de messagerie n&apos;est pas configuré.</p>
              </>
            )}
            {interestProduct && (
              <>
                <div className="section-kicker">ZIRCONAI / FUTURE RELEASE</div>
                <div className="modal-emblem">{interestProduct.symbol}</div>
                <h2>{interestProduct.name}</h2>
                <span className="status">DISPONIBLE PROCHAINEMENT</span>
                <p>Laissez-nous vos coordonnées si vous souhaitez être informé de l&apos;avancement et de la disponibilité de cette solution. Il ne s&apos;agit pas d&apos;une commande ni d&apos;une demande de démonstration.</p>
                {formState === "success" ? <div className="form-feedback success">{formMessage}</div> : (
                  <form className="registration-form" onSubmit={submitInterest}>
                    <label>Nom et prénom<input name="full_name" required minLength={2} maxLength={150} autoComplete="name" /></label>
                    <label>Email<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
                    <label className="consent"><input type="checkbox" name="consent" required /> J&apos;accepte d&apos;être recontacté au sujet du lancement de ce produit.</label>
                    {formMessage && <div className="form-feedback error">{formMessage}</div>}
                    <button className="button button-gold" disabled={formState === "sending"}>{formState === "sending" ? "Envoi…" : "Être informé du lancement ↗"}</button>
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
