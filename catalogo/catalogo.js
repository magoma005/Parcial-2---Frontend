// /frontend/catalogo/catalogo.js
const API_BASE = "http://localhost:8080";

// Helpers
const $  = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));
const money = (v) => `$${Number(v||0).toLocaleString("es-CO")} COP`;

// Carrito (reservaDraft)
function loadDraft(){
  try { return JSON.parse(localStorage.getItem("reservaDraft") || "null") || {}; }
  catch { return {}; }
}
function saveDraft(d){
  localStorage.setItem("reservaDraft", JSON.stringify(d || {}));
}

// Mapeo de ítem (sin categorías)
function mapItem(raw){
  return {
    id: raw.id,
    nombre: raw.nombre || "Producto",
    descripcion: raw.descripcion || "",
    precio: Number(raw.precio ?? 0),
    imagen: raw.imageUrl || raw.imagenUrl || raw.poster || ""
  };
}

// Tarjeta visual
function cardHTML(it){
  const alt = it.nombre.replace(/"/g,"&quot;");
  const img = it.imagen
    ? `<img src="${it.imagen}" alt="${alt}" style="width:100%; border-radius:12px; margin-bottom:12px;">`
    : `<div style="width:100%;height:180px;border-radius:12px;margin-bottom:12px;background:#222;display:flex;align-items:center;justify-content:center;color:#888;">Sin imagen</div>`;

  return `
    <div class="card" data-id="${it.id}" data-nombre="${it.nombre}" data-precio="${it.precio}" data-imagen="${it.imagen}">
      ${img}
      <h3>${it.nombre}</h3>
      ${it.descripcion ? `<p>${it.descripcion}</p>` : ""}
      <span class="price">${money(it.precio)}</span>
      <!-- 👇 OJO: aquí va .btn y .btn-add -->
      <button type="button" class="btn btn-add">Añadir</button>
    </div>
  `;
}

function renderAll(items){
  const grid = $("#catalogo-grid");
  if (!grid) return;
  if (!items.length){
    grid.innerHTML = `<p style="opacity:.7;">No hay productos para mostrar.</p>`;
  } else {
    grid.innerHTML = items.map(cardHTML).join("");
  }
}

// Lógica de carrito
function addToCart(item){
  const draft = loadDraft();
  draft.items = Array.isArray(draft.items) ? draft.items : [];

  const idx = draft.items.findIndex(x => x.id === item.id);
  if (idx >= 0){
    draft.items[idx].qty = (draft.items[idx].qty || 1) + 1;
  } else {
    draft.items.push({
      id: item.id,
      nombre: item.nombre,
      precio: item.precio,
      qty: 1,
      imagen: item.imagen || ""
    });
  }

  const subtotal = draft.items.reduce((s,x)=> s + (x.precio||0)*(x.qty||1), 0);
  draft.costos = { productos: subtotal, total: subtotal };
  saveDraft(draft);
}

function wireAddButtons(){
  $$(".card .btn-add").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const card = btn.closest(".card");
      const it = {
        id: card.dataset.id,
        nombre: card.dataset.nombre,
        precio: Number(card.dataset.precio || 0),
        imagen: card.dataset.imagen || ""
      };
      addToCart(it);
      btn.textContent = "Añadido ✓";
      btn.classList.add("added");
      btn.disabled = true;
      setTimeout(()=>{
        btn.textContent = "Añadir";
        btn.classList.remove("added");
        btn.disabled = false;
      }, 900);
    });
  });
}

// Carga del catálogo
async function loadCatalog(){
  const grid = $("#catalogo-grid");
  if (grid) grid.innerHTML = "<em>Cargando…</em>";

  try{
    const r = await fetch(`${API_BASE}/api/menu`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const data = await r.json();
    const items = (Array.isArray(data) ? data : []).map(mapItem);

    renderAll(items);
    wireAddButtons();
  }catch(e){
    console.error("[catalogo] error:", e);
    if (grid) grid.innerHTML = `<p style="color:#b00020;">No pude cargar el catálogo desde ${API_BASE}/api/menu</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadCatalog);
