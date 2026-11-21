"use client";
import {FormEvent,useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
const API=process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/,"");
export default function Connexion(){
 const router=useRouter(); const [mode,setMode]=useState<"login"|"register">("login"); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");const f=new FormData(e.currentTarget);
  const username=String(f.get("username")||"").trim(),password=String(f.get("password")||"");
  try{
   if(!API)throw new Error("API ProjectAcademy non configurée.");
   if(mode==="register"){
    const payload={username,password,email:String(f.get("email")||"").trim(),first_name:String(f.get("first_name")||"").trim(),last_name:String(f.get("last_name")||"").trim()};
    const reg=await fetch(API+"/api/auth/register/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const d=await reg.json();if(!reg.ok)throw new Error(Object.values(d).flat().join(" "));
   }
   const res=await fetch(API+"/api/auth/token/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,password})});
   const d=await res.json();if(!res.ok)throw new Error(d.detail||"Identifiants incorrects.");
   sessionStorage.setItem("projectacademy_access",d.access);sessionStorage.setItem("projectacademy_refresh",d.refresh);router.push("/espace-apprenant");
  }catch(err){setError(err instanceof Error?err.message:"Erreur inattendue.");}finally{setBusy(false);}
 }
 return <main className="auth-page"><section className="auth-card"><Link href="/" className="auth-brand">ZIRCON<span>AI</span><small>PROJECT ACADEMY</small></Link><div className="section-kicker">ESPACE MEMBRE / ACCÈS SÉCURISÉ</div><h1>{mode==="login"?"Heureux de vous revoir.":"Rejoignez ProjectAcademy."}</h1><p className="auth-intro">Accédez à votre espace et échangez avec l'assistant IA.</p><div className="auth-tabs"><button className={mode==="login"?"active":""} onClick={()=>{setMode("login");setError("");}}>Connexion</button><button className={mode==="register"?"active":""} onClick={()=>{setMode("register");setError("");}}>Créer un compte</button></div><form className="auth-form" onSubmit={submit}>{mode==="register"&&<><label>Prénom<input name="first_name" required maxLength={150}/></label><label>Nom<input name="last_name" required maxLength={150}/></label><label>Email<input name="email" type="email" required maxLength={254}/></label></>}<label>Identifiant<input name="username" required minLength={3} maxLength={150}/></label><label>Mot de passe<input name="password" type="password" required minLength={mode==="register"?12:1} maxLength={128}/></label>{mode==="register"&&<p className="auth-hint">12 caractères minimum.</p>}{error&&<div className="form-feedback error">{error}</div>}<button className="button button-gold" disabled={busy}>{busy?"Veuillez patienter…":mode==="login"?"Se connecter ↗":"Créer mon compte ↗"}</button></form><p className="auth-footnote">Utilisez un mot de passe unique. Ne partagez jamais vos identifiants.</p><Link href="/" className="auth-back">← Retour au site ZirconAI</Link></section></main>;
}
