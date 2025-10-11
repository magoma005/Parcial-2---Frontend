// /frontend/auth/auth.js
const API_BASE = "http://localhost:8080/api";

/* =========================
   Auth: storage & helpers
   ========================= */
export function setAuth(token, user){
  localStorage.setItem("authToken", token);
  localStorage.setItem("currentUser", JSON.stringify(user || null));
}
export function getToken(){ return localStorage.getItem("authToken"); }
export function isLoggedIn(){ return !!getToken(); }
export function authHeaders(){
  const t = getToken();
  return t ? { "Authorization": `Bearer ${t}` } : {};
}

export function logout(){
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
}

/* =========================
   Post-login redirect
   ========================= */
const REDIRECT_KEY = "afterLoginRedirect";
export function saveAfterLoginRedirect(url){
  localStorage.setItem(REDIRECT_KEY, url || "../catalogo/catalogo.html");
}
export function consumeAfterLoginRedirect(){
  const url = localStorage.getItem(REDIRECT_KEY) || "../catalogo/catalogo.html";
  localStorage.removeItem(REDIRECT_KEY);
  return url;
}

/* =========================
   API calls
   ========================= */
export async function login({email, password}){
  const r = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email, password })
  });
  if(!r.ok){
    const txt = await r.text();
    throw new Error(txt || "Credenciales inválidas");
  }
  const data = await r.json(); // { token, user }
  setAuth(data.token, data.user);
  return data.user;
}

export async function register({nombre, email, edad=0, password}){
  const r = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ nombre, email, edad, password })
  });
  if(!r.ok){
    const txt = await r.text();
    throw new Error(txt || "Error en registro");
  }
  const data = await r.json(); // { token, user }
  setAuth(data.token, data.user);
  return data.user;
}
