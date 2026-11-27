/* =========================================================
   LINK DEL PIA: cambia SOLO esta línea si el PIA cambia de dirección.
   ========================================================= */
const PIA_URL = "https://dvdatogro-123.github.io/AF03-PIA/";

/* Archivo XML con la información de intercambio */
const XML_URL = "data/intercambio.xml";

/* Las 7 etiquetas de cada <universidad>: ícono y descripción */
const ETIQUETAS = [
  { tag: "nombre",     ico: "bi-bank",            label: "Universidad",  desc: "Nombre oficial de la universidad destino" },
  { tag: "pais",       ico: "bi-flag",            label: "País",         desc: "País donde está la universidad" },
  { tag: "ciudad",     ico: "bi-geo-alt",         label: "Ciudad",       desc: "Ciudad del campus" },
  { tag: "programa",   ico: "bi-mortarboard",     label: "Programa",     desc: "Tipo de programa de movilidad" },
  { tag: "duracion",   ico: "bi-calendar-range",  label: "Duración",     desc: "Tiempo de la estancia" },
  { tag: "requisitos", ico: "bi-clipboard-check", label: "Requisitos",   desc: "Lo que pide la convocatoria para aplicar" },
  { tag: "sitioWeb",   ico: "bi-link-45deg",      label: "Sitio web",    desc: "Página oficial de la universidad" }
];

(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const normal = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollOpts = { behavior: reduce ? "auto" : "smooth", block: "center" };

  /* ---------- Botones del PIA (alerta antes de salir) ---------- */
  $$(".js-pia").forEach((a) => {
    a.href = PIA_URL;
    a.addEventListener("click", (ev) => {
      if (!confirm("Vas a ir a la página de nuestro PIA (AF03 · Equipo 1).\n\n¿Quieres continuar?")) ev.preventDefault();
    });
  });

  /* ---------- Leer el XML ---------- */
  let xmlTexto = "";
  let universidades = [];

  fetch(XML_URL)
    .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then((texto) => {
      xmlTexto = texto;
      const doc = new DOMParser().parseFromString(texto, "application/xml");
      if (doc.querySelector("parsererror")) throw new Error("El XML no está bien formado");
      leer(doc);
      pintarTodo(doc);
    })
    .catch((err) => {
      $("#pases").innerHTML = `<p class="error"><i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
        No se pudo leer <code>${XML_URL}</code> (${esc(err.message)}). Si abriste el archivo con doble clic, ábrelo desde GitHub Pages o con un servidor local.</p>`;
      alert("No se pudo cargar el archivo XML.\n\nAbre la página desde su link de GitHub Pages para que funcione.");
    });

  function leer(doc) {
    universidades = Array.from(doc.documentElement.getElementsByTagName("universidad")).map((u) => {
      const datos = {};
      ETIQUETAS.forEach((e) => { datos[e.tag] = (u.getElementsByTagName(e.tag)[0] || {}).textContent || ""; });
      return {
        id: u.getAttribute("id"), tipo: u.getAttribute("tipo"), codigo: u.getAttribute("codigo"),
        logo: u.getAttribute("logo"), foto: u.getAttribute("foto"), bandera: u.getAttribute("bandera"),
        ...datos
      };
    });
  }

  function pintarTodo(doc) {
    const raiz = doc.documentElement;
    $("#s-raiz").textContent = `<${raiz.nodeName}>`;
    $("#s-uni").textContent = universidades.length;
    $("#s-tags").textContent = ETIQUETAS.length;
    $("#s-paises").textContent = new Set(universidades.map((u) => u.pais)).size;

    pintarPases();
    pintarCodigo();
    pintarArbol(raiz);
    pintarTabla();
    activarBuscador();
  }

  /* ---------- Pases de abordar ---------- */
  function pintarPases() {
    $("#pases").innerHTML = universidades.map((u) => `
      <article class="pase" id="pase-${esc(u.id)}" data-tipo="${esc(u.tipo)}" aria-labelledby="t-${esc(u.id)}">
        <div class="pase-foto">
          <img src="${esc(u.foto)}" alt="Vista de ${esc(u.ciudad)}" loading="lazy">
          <span class="pase-tipo tipo-${esc(u.tipo)}"><i class="bi ${u.tipo === "nacional" ? "bi-geo-alt" : "bi-airplane"}" aria-hidden="true"></i> Intercambio ${esc(u.tipo)}</span>
        </div>

        <div class="pase-cuerpo">
          <div class="pase-ruta" aria-label="Ruta: de Monterrey a ${esc(u.ciudad)}">
            <div><b>MTY</b><small>FIME · Monterrey</small></div>
            <span class="ruta-linea" aria-hidden="true"><i class="bi bi-airplane-fill"></i></span>
            <div class="ruta-dest"><b>${esc(u.codigo)}</b><small>${esc(u.ciudad)}</small></div>
          </div>

          <header class="pase-head">
            <span class="pase-logo"><img src="${esc(u.logo)}" alt="Logo de ${esc(u.nombre)}" loading="lazy"></span>
            <div>
              <h3 id="t-${esc(u.id)}">${esc(u.nombre)}</h3>
              <p class="pase-pais"><img src="${esc(u.bandera)}" alt="" width="22" height="15"> ${esc(u.pais)}</p>
            </div>
          </header>

          <dl class="pase-datos">
            ${ETIQUETAS.filter((e) => !["nombre", "pais", "sitioWeb"].includes(e.tag)).map((e) => `
              <div class="${e.tag === "requisitos" ? "dato-full" : ""}">
                <dt><i class="bi ${e.ico}" aria-hidden="true"></i> ${e.label} <code>&lt;${e.tag}&gt;</code></dt>
                <dd>${esc(u[e.tag])}</dd>
              </div>`).join("")}
          </dl>

          <div class="pase-acciones">
            <a class="btn btn-primary js-sitio" href="${esc(u.sitioWeb)}" target="_blank" rel="noopener" data-nombre="${esc(u.nombre)}">
              <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Sitio oficial<span class="sr-only"> de ${esc(u.nombre)} (se abre en otra pestaña)</span>
            </a>
            <button type="button" class="btn btn-ghost js-verxml" data-id="${esc(u.id)}"><i class="bi bi-code-slash" aria-hidden="true"></i> Ver en el XML</button>
          </div>
        </div>
      </article>`).join("");
  }

  // Filtro nacional / internacional
  const chips = $$(".chip");
  chips.forEach((ch) => ch.addEventListener("click", () => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === ch)));
    $$(".pase").forEach((p) => { p.hidden = ch.dataset.f !== "todas" && p.dataset.tipo !== ch.dataset.f; });
  }));

  // Alertas de los botones de cada pase
  document.addEventListener("click", (ev) => {
    const sitio = ev.target.closest(".js-sitio");
    if (sitio && !confirm(`Vas a salir de esta página para visitar el sitio oficial de:\n${sitio.dataset.nombre}\n\n¿Continuar?`)) {
      ev.preventDefault();
      return;
    }
    const ver = ev.target.closest(".js-verxml");
    if (ver) resaltarXml(ver.dataset.id);
  });

  /* ---------- Código XML con colores ---------- */
  // Los comentarios se separan primero para no colorear las etiquetas que mencionan
  function resaltar(src) {
    return src.split(/(<!--[\s\S]*?-->)/g)
      .map((parte, i) => (i % 2 ? `<span class="t-cmt">${esc(parte)}</span>` : resaltarEtiquetas(esc(parte))))
      .join("");
  }
  function resaltarEtiquetas(html) {
    return html
      .replace(/(&lt;\?[\s\S]*?\?&gt;)/g, '<span class="t-pro">$1</span>')
      .replace(/(&lt;\/?)([\w:.-]+)((?:\s+[\w:.-]+=&quot;[^&]*?&quot;)*)\s*(\/?&gt;)/g, (m, a, name, attrs, b) =>
        `<span class="t-tag">${a}${name}</span>` +
        attrs.replace(/([\w:.-]+)=(&quot;[^&]*?&quot;)/g, ' <span class="t-attr">$1</span>=<span class="t-val">$2</span>') +
        `<span class="t-tag">${b}</span>`);
  }

  function pintarCodigo() {
    // Envuelve cada bloque <universidad>…</universidad> para poder resaltarlo
    const html = resaltar(xmlTexto).replace(
      /(<span class="t-tag">&lt;universidad<\/span>[\s\S]*?<span class="t-attr">id<\/span>=<span class="t-val">&quot;([\w-]+)&quot;<\/span>[\s\S]*?<span class="t-tag">&lt;\/universidad<\/span><span class="t-tag">&gt;<\/span>)/g,
      (m, bloque, id) => `<span class="xml-bloque" id="xml-${id}">${bloque}</span>`);
    $("#xmlCode").innerHTML = html;
  }

  function resaltarXml(id) {
    const b = $("#xml-" + id);
    if (!b) return;
    b.scrollIntoView(scrollOpts);
    b.classList.remove("activo"); void b.offsetWidth; b.classList.add("activo");
  }

  // Validar: alerta con el resultado
  $("#btnValidar").addEventListener("click", () => {
    if (!xmlTexto) { alert("Todavía no se ha cargado el XML."); return; }
    const doc = new DOMParser().parseFromString(xmlTexto, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) { alert("El XML NO está bien formado:\n\n" + err.textContent.slice(0, 200)); return; }
    const raiz = doc.documentElement;
    const unis = raiz.getElementsByTagName("universidad");
    const detalle = Array.from(unis).map((u) => `• ${u.getAttribute("id")}: ${u.children.length} etiquetas (${Array.from(u.children).map((c) => c.nodeName).join(", ")})`).join("\n");
    alert(`El XML está bien formado.\n\nEtiqueta raíz: <${raiz.nodeName}>\nUniversidades: ${unis.length}\n\n${detalle}`);
  });

  /* ---------- Árbol y tabla ---------- */
  function pintarArbol(raiz) {
    const attrs = (el) => Array.from(el.attributes).filter((a) => ["id", "tipo", "facultad"].includes(a.name))
      .map((a) => ` <span class="a-attr">${a.name}="${esc(a.value)}"</span>`).join("");
    $("#arbol").innerHTML = `<li><span class="nodo nodo-raiz">&lt;${raiz.nodeName}&gt;</span>${attrs(raiz)}
      <ul>${Array.from(raiz.children).map((u) => `<li><span class="nodo">&lt;${u.nodeName}&gt;</span>${attrs(u)}
        <ul>${Array.from(u.children).map((c) => `<li><span class="nodo nodo-hoja">&lt;${c.nodeName}&gt;</span></li>`).join("")}</ul>
      </li>`).join("")}</ul></li>`;
  }

  function pintarTabla() {
    $("#tablaTags").innerHTML = ETIQUETAS.map((e, i) => `
      <tr><td>${i + 1}</td><td><code>&lt;${e.tag}&gt;</code></td><td><i class="bi ${e.ico}" aria-hidden="true"></i> ${e.desc}</td></tr>`).join("");
  }

  /* ---------- Buscador con alertas ---------- */
  function activarBuscador() {
    const opciones = new Set();
    universidades.forEach((u) => [u.nombre, u.pais, u.ciudad].forEach((v) => opciones.add(v)));
    opciones.add("UNAM"); opciones.add("INSA Lyon");
    $("#lista-destinos").innerHTML = Array.from(opciones).map((v) => `<option value="${esc(v)}"></option>`).join("");

    $("#buscador").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const raw = $("#q").value.trim();
      const q = normal(raw);
      if (!q) return;
      const u = universidades.find((x) => normal([x.nombre, x.pais, x.ciudad, x.id, x.codigo, x.tipo, x.programa].join(" ")).includes(q));

      if (!u) {
        alert(`No encontré "${raw}" en el XML.\n\nDestinos disponibles:\n${universidades.map((x) => `• ${x.nombre} (${x.ciudad}, ${x.pais})`).join("\n")}`);
        return;
      }
      if (confirm(`Destino encontrado: ${u.nombre}\n${u.ciudad}, ${u.pais} · Intercambio ${u.tipo}\nDuración: ${u.duracion}\n\n¿Quieres ir a su sitio oficial?\n${u.sitioWeb}`)) {
        window.open(u.sitioWeb, "_blank", "noopener");
      } else {
        chips[0].click();
        const pase = $("#pase-" + u.id);
        pase.scrollIntoView(scrollOpts);
        pase.classList.remove("destacar"); void pase.offsetWidth; pase.classList.add("destacar");
      }
    });
  }
})();
