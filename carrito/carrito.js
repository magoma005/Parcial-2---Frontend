const $ = id => document.getElementById(id);
const money = v => `$${Number(v || 0).toLocaleString("es-CO")} COP`;

function loadReceipt() {
  let draft = null;
  try {
    draft = JSON.parse(localStorage.getItem("reservaDraft") || "null");
  } catch {}

  if (!draft) {
    alert("No hay datos en el carrito.");
    window.location.href = "../catalogo/catalogo.html";
    return;
  }

  paintFromDraft(draft);

  // Botón de pago
  const btn = $("btnPagar");
  if (btn) {
    btn.addEventListener("click", () => {
      // Aquí defines la acción del pago
      window.location.href = "../pago/pago.html";
    });
  }
}

function paintFromDraft(draft) {
  const meta = draft.meta || {};

  if (meta.poster) $("reciboPoster").src = meta.poster;
  $("reciboTitulo").textContent = meta.titulo || "Producto";
  $("reciboDescripcion").textContent = meta.descripcion || meta.director || "—";

  const costos = draft.costos || {};
  const productos = costos.comida || costos.productos || costos.boletas || 0;
  const total = costos.total ?? productos;

  $("reciboProducto").textContent = money(productos);
  $("reciboTotal").textContent = money(total);
}

document.addEventListener("DOMContentLoaded", loadReceipt);
