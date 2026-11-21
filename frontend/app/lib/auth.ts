export const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "").replace(/\/api$/, "");

const ACCESS = "projectacademy_access";
const REFRESH = "projectacademy_refresh";

export function getAccessToken(): string | null {
  try { return sessionStorage.getItem(ACCESS); } catch { return null; }
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken());
}

async function refreshAccess(): Promise<string | null> {
  try {
    const refresh = sessionStorage.getItem(REFRESH);
    if (!API || !refresh) return null;
    const response = await fetch(`${API}/api/auth/token/refresh/`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    sessionStorage.setItem(ACCESS, data.access);
    if (data.refresh) sessionStorage.setItem(REFRESH, data.refresh);
    return data.access as string;
  } catch { return null; }
}

/** fetch authentifié : renouvelle une fois le jeton d'accès s'il a expiré (durée de vie 15 min). */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API) throw new Error("API ProjectAcademy non configurée.");
  const run = (token: string | null) => fetch(`${API}${path}`, {
    ...init,
    headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...(init.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  let response = await run(getAccessToken());
  if (response.status === 401) {
    const renewed = await refreshAccess();
    if (renewed) response = await run(renewed);
  }
  return response;
}

/** Ne garde qu'un chemin interne (« /… » mais pas « //… ») pour éviter les redirections ouvertes. */
export function safeNext(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  return value;
}
