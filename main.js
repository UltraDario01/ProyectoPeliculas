/**
 * CineVault — main.js
 * ─────────────────────────────────────────────
 * CRUD completo de películas.
 *
 * En producción, las funciones de "base de datos"
 * (cargar, guardar) se reemplazarían por llamadas
 * fetch() a una API REST que conecte con MySQL.
 *
 * Para desarrollo local sin servidor se usa
 * localStorage como simulación de persistencia.
 * ─────────────────────────────────────────────
 */

'use strict';

/* ══════════════════════════
   1. CAPA DE "BASE DE DATOS"
   (simulada con localStorage)
   ══════════════════════════ */

const DB_KEY = 'cinevault_peliculas';

/**
 * Devuelve el array de películas almacenadas.
 * @returns {Array}
 */
function dbCargar() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
  } catch {
    return [];
  }
}

/**
 * Persiste el array de películas.
 * @param {Array} peliculas
 */
function dbGuardar(peliculas) {
  localStorage.setItem(DB_KEY, JSON.stringify(peliculas));
}

/**
 * Genera un ID único simple (timestamp + random).
 * @returns {string}
 */
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ══════════════════════════
   2. OPERACIONES CRUD
   ══════════════════════════ */

/**
 * CREATE — Agrega una película nueva.
 * @param {Object} datos  { titulo, descripcion, puntaje, duracion }
 * @returns {Object}      La película creada con su id
 */
function crearPelicula(datos) {
  const peliculas = dbCargar();
  const nueva = {
    id: generarId(),
    titulo:      datos.titulo.trim(),
    descripcion: datos.descripcion.trim(),
    puntaje:     parseFloat(datos.puntaje),
    duracion:    parseInt(datos.duracion, 10),
    creadaEn:    new Date().toISOString(),
  };
  peliculas.push(nueva);
  dbGuardar(peliculas);
  return nueva;
}

/**
 * READ — Devuelve todas las películas (opcionalmente filtradas).
 * @param {string} [busqueda='']  Texto a buscar en el título
 * @returns {Array}
 */
function leerPeliculas(busqueda = '') {
  const peliculas = dbCargar();
  if (!busqueda) return peliculas;
  const q = busqueda.toLowerCase();
  return peliculas.filter(p => p.titulo.toLowerCase().includes(q));
}

/**
 * READ ONE — Devuelve una película por su ID.
 * @param {string} id
 * @returns {Object|null}
 */
function leerPelicula(id) {
  return dbCargar().find(p => p.id === id) || null;
}

/**
 * UPDATE — Actualiza los datos de una película existente.
 * @param {string} id
 * @param {Object} datos  { titulo, descripcion, puntaje, duracion }
 * @returns {Object|null}  La película actualizada
 */
function actualizarPelicula(id, datos) {
  const peliculas = dbCargar();
  const idx = peliculas.findIndex(p => p.id === id);
  if (idx === -1) return null;

  peliculas[idx] = {
    ...peliculas[idx],
    titulo:      datos.titulo.trim(),
    descripcion: datos.descripcion.trim(),
    puntaje:     parseFloat(datos.puntaje),
    duracion:    parseInt(datos.duracion, 10),
  };
  dbGuardar(peliculas);
  return peliculas[idx];
}

/**
 * DELETE — Elimina una película por su ID.
 * @param {string} id
 * @returns {boolean}  true si se eliminó, false si no existía
 */
function eliminarPelicula(id) {
  const peliculas = dbCargar();
  const nuevas = peliculas.filter(p => p.id !== id);
  if (nuevas.length === peliculas.length) return false;
  dbGuardar(nuevas);
  return true;
}

/* ══════════════════════════
   3. VALIDACIÓN
   ══════════════════════════ */

/**
 * Valida los campos del formulario.
 * @param {Object} datos
 * @returns {{ valido: boolean, mensaje: string }}
 */
function validar(datos) {
  if (!datos.titulo || datos.titulo.trim() === '') {
    return { valido: false, mensaje: 'El título es obligatorio.' };
  }
  if (datos.titulo.trim().length > 120) {
    return { valido: false, mensaje: 'El título no puede superar 120 caracteres.' };
  }
  const puntaje = parseFloat(datos.puntaje);
  if (isNaN(puntaje) || puntaje < 0 || puntaje > 10) {
    return { valido: false, mensaje: 'El puntaje debe ser un número entre 0 y 10.' };
  }
  const duracion = parseInt(datos.duracion, 10);
  if (isNaN(duracion) || duracion < 1 || duracion > 999) {
    return { valido: false, mensaje: 'La duración debe ser un número entre 1 y 999 minutos.' };
  }
  return { valido: true, mensaje: '' };
}

/* ══════════════════════════
   4. RENDERIZADO / UI
   ══════════════════════════ */

/**
 * Clasifica el puntaje en categorías para el badge.
 * @param {number} puntaje
 * @returns {string}  Clase CSS ('high' | 'medium' | 'low')
 */
function clasePuntaje(puntaje) {
  if (puntaje >= 7.5) return 'high';
  if (puntaje >= 5)   return 'medium';
  return 'low';
}

/**
 * Genera el HTML de una tarjeta de película.
 * @param {Object} pelicula
 * @param {number} numero    Posición en la lista (para el decorado)
 * @returns {string}
 */
function htmlTarjeta(pelicula, numero) {
  const clase  = clasePuntaje(pelicula.puntaje);
  const desc   = pelicula.descripcion || '<em>Sin descripción</em>';
  const numStr = String(numero).padStart(2, '0');

  return `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="movie-card" data-id="${pelicula.id}">
        <span class="movie-number">${numStr}</span>

        <h3 class="movie-title">${escaparHTML(pelicula.titulo)}</h3>

        <p class="movie-desc">${escaparHTML(pelicula.descripcion) || '<em>Sin descripción</em>'}</p>

        <div class="movie-meta">
          <span class="score-badge ${clase}">
            <i class="bi bi-star-fill"></i>
            ${pelicula.puntaje.toFixed(1)}
          </span>
          <span class="meta-badge">
            <i class="bi bi-clock"></i>
            ${pelicula.duracion} min
          </span>
        </div>

        <div class="card-actions">
          <button class="btn-card btn-edit"   onclick="abrirEditar('${pelicula.id}')">
            <i class="bi bi-pencil me-1"></i>Editar
          </button>
          <button class="btn-card btn-delete" onclick="abrirEliminar('${pelicula.id}', '${escaparHTML(pelicula.titulo)}')">
            <i class="bi bi-trash me-1"></i>Eliminar
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Escapa caracteres especiales de HTML para evitar XSS.
 * @param {string} str
 * @returns {string}
 */
function escaparHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

/**
 * Re-renderiza el grid de películas completo.
 * @param {string} [busqueda='']
 */
function renderizarPeliculas(busqueda = '') {
  const grid  = document.getElementById('peliculasGrid');
  const vacio = document.getElementById('estadoVacio');
  const lista = leerPeliculas(busqueda);

  if (lista.length === 0) {
    grid.innerHTML = '';
    vacio.classList.remove('d-none');
  } else {
    vacio.classList.add('d-none');
    grid.innerHTML = lista
      .map((p, i) => htmlTarjeta(p, i + 1))
      .join('');
  }

  actualizarEstadisticas();
}

/**
 * Actualiza las tarjetas de estadísticas en el header.
 */
function actualizarEstadisticas() {
  const peliculas = dbCargar();   // siempre el total, sin filtro
  const total = peliculas.length;

  document.getElementById('totalPeliculas').textContent = total;

  if (total === 0) {
    document.getElementById('puntajePromedio').textContent = '—';
    document.getElementById('duracionPromedio').textContent = '—';
    return;
  }

  const promPuntaje  = peliculas.reduce((s, p) => s + p.puntaje,  0) / total;
  const promDuracion = peliculas.reduce((s, p) => s + p.duracion, 0) / total;

  document.getElementById('puntajePromedio').textContent  = promPuntaje.toFixed(1);
  document.getElementById('duracionPromedio').textContent = Math.round(promDuracion) + ' min';
}

/* ══════════════════════════
   5. LÓGICA DEL FORMULARIO
   ══════════════════════════ */

const peliculaModal = new bootstrap.Modal(document.getElementById('peliculaModal'));

/** Limpia y prepara el modal para una película nueva. */
function abrirNueva() {
  document.getElementById('modalLabel').textContent = 'Nueva película';
  document.getElementById('peliculaId').value  = '';
  document.getElementById('titulo').value       = '';
  document.getElementById('descripcion').value  = '';
  document.getElementById('puntaje').value      = '';
  document.getElementById('duracion').value     = '';
  ocultarError();
}

/**
 * Abre el modal con los datos de una película para editar.
 * @param {string} id
 */
function abrirEditar(id) {
  const p = leerPelicula(id);
  if (!p) return;

  document.getElementById('modalLabel').textContent  = 'Editar película';
  document.getElementById('peliculaId').value   = p.id;
  document.getElementById('titulo').value       = p.titulo;
  document.getElementById('descripcion').value  = p.descripcion;
  document.getElementById('puntaje').value      = p.puntaje;
  document.getElementById('duracion').value     = p.duracion;
  ocultarError();
  peliculaModal.show();
}

/** Maneja el clic en "Guardar" del modal. */
function manejarGuardar() {
  const datos = {
    titulo:      document.getElementById('titulo').value,
    descripcion: document.getElementById('descripcion').value,
    puntaje:     document.getElementById('puntaje').value,
    duracion:    document.getElementById('duracion').value,
  };

  const { valido, mensaje } = validar(datos);
  if (!valido) {
    mostrarError(mensaje);
    return;
  }

  const id = document.getElementById('peliculaId').value;

  if (id) {
    // UPDATE
    actualizarPelicula(id, datos);
  } else {
    // CREATE
    crearPelicula(datos);
  }

  peliculaModal.hide();
  renderizarPeliculas(document.getElementById('busqueda').value);
}

function mostrarError(msg) {
  const el = document.getElementById('formError');
  el.textContent = msg;
  el.classList.remove('d-none');
}

function ocultarError() {
  document.getElementById('formError').classList.add('d-none');
}

/* ══════════════════════════
   6. LÓGICA DE ELIMINAR
   ══════════════════════════ */

let idPendienteEliminar = null;
const eliminarModal = new bootstrap.Modal(document.getElementById('eliminarModal'));

/**
 * Abre el modal de confirmación de borrado.
 * @param {string} id
 * @param {string} nombre
 */
function abrirEliminar(id, nombre) {
  idPendienteEliminar = id;
  document.getElementById('eliminarNombre').textContent =
    `"${nombre}" se eliminará de forma permanente.`;
  eliminarModal.show();
}

/** Confirma y ejecuta la eliminación. */
function confirmarEliminar() {
  if (!idPendienteEliminar) return;
  eliminarPelicula(idPendienteEliminar);
  idPendienteEliminar = null;
  eliminarModal.hide();
  renderizarPeliculas(document.getElementById('busqueda').value);
}

/* ══════════════════════════
   7. EVENTOS
   ══════════════════════════ */

// Botón "Nueva película" en el header — resetea el modal
document.getElementById('btnNueva').addEventListener('click', abrirNueva);

// Guardar en el modal
document.getElementById('btnGuardar').addEventListener('click', manejarGuardar);

// Confirmar eliminar
document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminar);

// Búsqueda en tiempo real
document.getElementById('busqueda').addEventListener('input', (e) => {
  renderizarPeliculas(e.target.value);
});

// Tecla Enter en el modal → guardar
document.getElementById('peliculaModal').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') manejarGuardar();
});

/* ══════════════════════════
   8. INICIO
   ══════════════════════════ */

// Renderizado inicial
renderizarPeliculas();

/*
 * ─────────────────────────────────────────────────────────
 *  NOTA PARA CONECTAR CON MySQL (backend real)
 * ─────────────────────────────────────────────────────────
 *  Reemplaza las funciones de DB (sección 1 y 2) por
 *  llamadas fetch() a tu API:
 *
 *  // Leer todas
 *  const res  = await fetch('/api/peliculas');
 *  const data = await res.json();
 *
 *  // Crear
 *  await fetch('/api/peliculas', {
 *    method: 'POST',
 *    headers: { 'Content-Type': 'application/json' },
 *    body: JSON.stringify(datos),
 *  });
 *
 *  // Actualizar
 *  await fetch(`/api/peliculas/${id}`, {
 *    method: 'PUT',
 *    headers: { 'Content-Type': 'application/json' },
 *    body: JSON.stringify(datos),
 *  });
 *
 *  // Eliminar
 *  await fetch(`/api/peliculas/${id}`, { method: 'DELETE' });
 * ─────────────────────────────────────────────────────────
 */
