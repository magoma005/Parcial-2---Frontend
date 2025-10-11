# 🕹️ Pixel & Slice – Frontend (HTML, CSS, JavaScript)

Interfaz web de la tienda de videojuegos **Pixel & Slice**.  
Permite a los usuarios **registrarse, iniciar sesión, explorar el catálogo de juegos, añadir productos al carrito y realizar compras completas**, comunicándose directamente con el backend en **Spring Boot**.

---

## 🚀 Requisitos

- **Navegador moderno** (Chrome, Edge, Firefox o Safari)
- **Servidor local o extensión Live Server**
- **Backend en ejecución:** `http://localhost:8080`

> 💡 *No usa frameworks ni librerías externas.*  
> El frontend está construido únicamente con **HTML, CSS y JavaScript puro**, usando `fetch()` para comunicarse con el backend y `localStorage` para guardar la sesión y el carrito.

---

## ▶️ Ejecución en modo desarrollo

### 🔸 Opción 1 — Usando Live Server (recomendada)
1. Abre la carpeta `frontend/` en **Visual Studio Code**.  
2. Haz clic derecho sobre `login/login.html` y selecciona **“Open with Live Server”**.  
3. El navegador abrirá automáticamente la aplicación en una URL similar a: http://127.0.0.1:5500/frontend/login/login.html
   
### 🔸 Opción 2 — Ejecutar directamente en el navegador
1. Abre el archivo: con doble clic o arrastrándolo al navegador.
3. Asegúrate de que el backend esté corriendo en `http://localhost:8080` para que las peticiones funcionen correctamente.

---

## 🧩 Estructura del proyecto
frontend/
├── auth/
│ └── auth.js → Manejo de autenticación, tokens y sesión
│
├── login/
│ ├── login.html → Página de inicio de sesión
│ ├── registro.html → Página de registro de usuario
│ └── login.css → Estilos del login y registro
│
├── catalogo/
│ ├── catalogo.html → Catálogo de videojuegos
│ ├── catalogo.css → Estilos visuales del catálogo
│ └── catalogo.js → Lógica de carga del catálogo y carrito
│
├── carrito/
│ ├── carrito.html → Vista del carrito de compras
│ ├── carrito.css → Estilos del carrito
│ └── carrito.js → Lógica de cantidades, totales y eliminación
│
├── confirmacion/
│ ├── confirmacion.html → Resumen final de compra
│ ├── confirmacion.css → Estilos del resumen
│ └── confirmacion.js → Limpieza del carrito y render del resumen

## 🔗 Conexión con el backend

El frontend se comunica con el backend desplegado en: http://localhost:8080/api


| Acción | Método | Endpoint |
|--------|---------|----------|
| Registro de usuario | `POST` | `/api/auth/register` |
| Inicio de sesión | `POST` | `/api/auth/login` |
| Obtener catálogo | `GET` | `/api/menu` |
| Crear orden de compra | `POST` | `/api/orders` |
| Confirmar pago | `POST` | `/api/orders/{id}/pay` |
| Ver recibo final | `GET` | `/api/orders/{id}/receipt` |

> ⚠️ Antes de abrir el frontend, asegúrate de que el backend esté corriendo correctamente con `mvn spring-boot:run`.  
> De lo contrario, verás errores de red como **“Failed to fetch”**.

---
