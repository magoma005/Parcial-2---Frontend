// /frontend/carrito/carrito.js
const API_BASE = "http://localhost:8080";

const $  = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
const money = (v) => `$${Number(v||0).toLocaleString("es-CO")} COP`;

// ---------- Storage ----------
function loadDraft(){
  try { return JSON.parse(localStorage.getItem("reservaDraft") || "null") || {}; }
  catch { return {}; }
}
function saveDraft(d){ localStorage.setItem("reservaDraft", JSON.stringify(d || {})); }
function clearCart(){ localStorage.setItem("reservaDraft", "{}"); }

// ---------- Totales ----------
function recalcTotals(draft){
  const subtotal = (draft.items||[]).reduce((s,it)=> s + (it.precio||0)*(it.qty||1), 0);
  draft.costos = { productos: subtotal, total: subtotal };
}
function renderTotals(draft){
  $("#subtotal").textContent = money(draft?.costos?.productos || 0);
  $("#total").textContent    = money(draft?.costos?.total     || 0);
}

// ---------- Fila visual (se mantiene igual) ----------
function itemRowHTML(it){
  const img = it.imagen
    ? `<img src="${it.imagen}" alt="${it.nombre.replace(/"/g,"&quot;")}">`
    : `<div class="noimg">Sin imagen</div>`;
  const sub = (it.precio||0) * (it.qty||1);

  return `
    <div class="carrito-item" data-id="${it.id}">
      <div class="thumb">${img}</div>
      <div class="info">
        <h4>${it.nombre}</h4>
        <div class="precio-linea">
          <span class="unit">${money(it.precio)} </span>

          <div class="qty">
            <button type="button" class="qty-minus" aria-label="Disminuir">−</button>
            <input
              class="qty-input"
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
              value="${it.qty||1}"
              aria-label="Cantidad"
            />
            <button type="button" class="qty-plus" aria-label="Aumentar">+</button>
          </div>

          <span class="subtotal">${money(sub)}</span>
        </div>
      </div>

      <button type="button" class="remove" title="Quitar">✕</button>
    </div>
  `;
}

// ---------- Wire fila (se mantiene igual) ----------
function wireRow(draft, row){
  const id       = row.dataset.id;
  const minus    = row.querySelector(".qty-minus");
  const plus     = row.querySelector(".qty-plus");
  const input    = row.querySelector(".qty-input");
  const remove   = row.querySelector(".remove");
  const subtotal = row.querySelector(".subtotal");

  const idx = draft.items.findIndex(x => x.id === id);
  if (idx < 0) return;

  // bloquear flechas/rueda
  input.addEventListener("keydown", (e)=>{
    if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
    }
  });
  input.addEventListener("wheel", (e)=>{ e.preventDefault(); input.blur(); });

  const clamp = (n) => Math.max(1, Math.min(99, n|0));

  function updateQty(newQty){
    draft.items[idx].qty = clamp(newQty);
    input.value = draft.items[idx].qty;
    const sub = (draft.items[idx].precio||0) * draft.items[idx].qty;
    subtotal.textContent = money(sub);
    recalcTotals(draft);
    renderTotals(draft);
    saveDraft(draft);
  }

  minus.addEventListener("click", ()=> updateQty((parseInt(input.value||"1",10) || 1) - 1));
  plus .addEventListener("click", ()=> updateQty((parseInt(input.value||"1",10) || 1) + 1));

  input.addEventListener("input", ()=>{
    const n = clamp(parseInt(input.value||"1",10) || 1);
    updateQty(n);
  });

  remove.addEventListener("click", ()=>{
    draft.items.splice(idx, 1);
    recalcTotals(draft);
    saveDraft(draft);
    renderCart();
  });
}

// ---------- Render del carrito (idéntico visual) ----------
function renderCart(){
  const draft = loadDraft();
  draft.items = Array.isArray(draft.items) ? draft.items : [];
  recalcTotals(draft);

  const cont = $("#carrito-items");
  if (!draft.items.length){
    cont.innerHTML = `<p style="opacity:.7;">Tu carrito está vacío.</p>`;
  } else {
    cont.innerHTML = draft.items.map(itemRowHTML).join("");
    $$("#carrito-items .carrito-item").forEach(row => wireRow(draft, row));
  }
  renderTotals(draft);

  const btn = $("#btnPagar");
  if (btn){
    btn.onclick = () => procederPago(); // <— aquí ahora llamamos al flujo real de pago
  }
}

// ---------- Flujo de pago / orden ----------
async function procederPago(){
  const btn = $("#btnPagar");
  const draft = loadDraft();
  const items = Array.isArray(draft.items) ? draft.items : [];

  if (!items.length) { alert("Tu carrito está vacío."); return; }

  try {
    if (btn) { btn.disabled = true; btn.textContent = "Procesando…"; }

    // payload esperado por backend: [{reference, qty}]
    const lines = items.map(x => ({ reference: x.id, qty: x.qty||1 }));

    // 1) crear orden
    const r = await fetch(`${API_BASE}/api/orders`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ items: lines })
    });
    if (!r.ok) throw new Error("No pude crear la orden");
    const order = await r.json(); // {id,...}

    // 2) pagar
    const rPay = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(order.id)}/pay`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({})
    });
    if (!rPay.ok) throw new Error("No se pudo confirmar el pago");

    // 3) construir y guardar recibo local (fallback por si el backend no responde después)
    const localReceipt = {
      fechaLarga: new Date().toLocaleString("es-CO", { dateStyle:"medium", timeStyle:"short" }),
      items: items.map(x => ({
        nombre   : x.nombre,
        qty      : x.qty||1,
        unitPrice: x.precio||0,
        subtotal : (x.precio||0) * (x.qty||1),
        imagen   : x.imagen || ""
      })),
      costos: {
        productos: items.reduce((s,x)=>s+(x.precio||0)*(x.qty||1),0),
        cargo: 0,
        total: items.reduce((s,x)=>s+(x.precio||0)*(x.qty||1),0)
      }
    };
    localStorage.setItem("lastReceiptCache", JSON.stringify(localReceipt));
    localStorage.setItem("lastOrderId", order.id);

    // 4) vaciar carrito y redirigir
    clearCart();
    window.location.href = `../confirmacion/confirmacion.html?orderId=${encodeURIComponent(order.id)}`;

  } catch (e) {
    console.error(e);
    alert(e.message || "Error procesando el pago.");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Proceder al pago"; }
  }
}

document.addEventListener("DOMContentLoaded", renderCart);
