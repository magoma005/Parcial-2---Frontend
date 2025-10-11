// /frontend/confirmacion/confirmacion.js
const API_BASE = "http://localhost:8080";
const $ = (s, ctx=document) => ctx.querySelector(s);
const money = (v) => `$${Number(v||0).toLocaleString("es-CO")} COP`;

function getOrderId(){
  const u = new URL(location.href);
  return u.searchParams.get("orderId") || localStorage.getItem("lastOrderId");
}

function renderFromReceipt(rec, orderId){
  $("#ordLink").textContent = orderId || "—";
  $("#ordLink").href = "#";
  $("#fecha").textContent = rec.fechaLarga || rec.fecha || new Date().toLocaleString("es-CO");

  // Preferimos items detallados si existen
  const items = Array.isArray(rec.items) ? rec.items : [];

  const cont = $("#listaItems");
  if (items.length){
    cont.innerHTML = items.map(it => `
      <div class="item-row">
        ${it.imagen ? `<img src="${it.imagen}" alt="">` : ""}
        <div class="i-name">${it.nombre||"Producto"}</div>
        <div class="i-qty">x${it.qty||1}</div>
        <div class="i-price">${money((it.unitPrice||0)*(it.qty||1))}</div>
      </div>
    `).join("");
  } else {
    // Fallback ultra simple si el backend devuelve solo nombres (r.comidas en legado)
    const nombres = rec.comidas || rec.productos || [];
    cont.innerHTML = nombres.map(n => `
      <div class="item-row"><div class="i-name">${n}</div></div>
    `).join("");
  }

  const total =
    rec?.costos?.total ??
    items.reduce((s,it)=> s + (it.unitPrice||0)*(it.qty||1), 0) ?? 0;

  $("#totalPagado").textContent = money(total);
}

async function loadConfirmation(){
  const orderId = getOrderId();
  if (!orderId){
    alert("No hay orden para mostrar.");
    window.location.href = "../catalogo/catalogo.html";
    return;
  }

  try{
    const r = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderId)}/receipt`);
    if (!r.ok) throw new Error("HTTP "+r.status);
    const rec = await r.json();
    renderFromReceipt(rec, orderId);
  }catch(e){
    console.warn("[confirmación] backend no disponible, uso recibo local:", e);
    // Fallback
    let rec = null;
    try { rec = JSON.parse(localStorage.getItem("lastReceiptCache") || "null"); } catch {}
    if (!rec){
      alert("No se pudo cargar el recibo.");
      window.location.href = "../catalogo/catalogo.html";
      return;
    }
    renderFromReceipt(rec, orderId);
  }
}

document.addEventListener("DOMContentLoaded", loadConfirmation);
