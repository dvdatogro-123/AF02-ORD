/* =========================================================
   AF02 · Intercambio FIME — parte interactiva de index.xml
   La página ES el documento XML: este script lee sus etiquetas
   y agrega encima logos, fotos, alertas y botones (en XHTML).
   ========================================================= */

/* LINK DEL PIA: cambia SOLO esta línea si el PIA cambia de dirección. */
const PIA_URL = "https://dvdatogro-123.github.io/AF03-PIA/";

/* Las 7 etiquetas de cada <universidad> */
const ETIQUETAS = [
  { tag: "nombre",     ico: "bi-bank",            desc: "Nombre oficial de la universidad destino" },
  { tag: "pais",       ico: "bi-flag",            desc: "País donde está la universidad" },
  { tag: "ciudad",     ico: "bi-geo-alt",         desc: "Ciudad del campus" },
  { tag: "programa",   ico: "bi-mortarboard",     desc: "Tipo de programa de movilidad" },
  { tag: "duracion",   ico: "bi-calendar-range",  desc: "Tiempo de la estancia" },
  { tag: "requisitos", ico: "bi-clipboard-check", desc: "Lo que pide la convocatoria para aplicar" },
  { tag: "sitioWeb",   ico: "bi-link-45deg",      desc: "Página oficial de la universidad" }
];

(function () {
  "use strict";

  const XHTML = "http://www.w3.org/1999/xhtml";
  const raiz = document.documentElement;                 // <intercambio>
  const unis = Array.from(raiz.getElementsByTagName("universidad"));
  const texto = (el, tag) => (el.getElementsByTagName(tag)[0] || {}).textContent || "";
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const normal = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollOpts = { behavior: reduce ? "auto" : "smooth", block: "center" };
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // Convierte texto XHTML en nodos que se pueden insertar en el documento XML
  function h(markup) {
    const doc = new DOMParser().parseFromString(`<div xmlns="${XHTML}" class="x">${markup}</div>`, "application/xml");
    const err = doc.getElementsByTagName("parsererror")[0];
    if (err) { console.error("XHTML inválido:", err.textContent, markup); }
    return document.importNode(doc.documentElement, true);
  }
  const bloque = (markup) => { const w = h(markup); w.removeAttribute("class"); return w.firstElementChild; };

  // Datos leídos del XML
  const datos = unis.map((u) => ({
    el: u, id: u.getAttribute("id"), tipo: u.getAttribute("tipo"), codigo: u.getAttribute("codigo"),
    logo: u.getAttribute("logo"), foto: u.getAttribute("foto"), bandera: u.getAttribute("bandera"),
    nombre: texto(u, "nombre"), pais: texto(u, "pais"), ciudad: texto(u, "ciudad"),
    programa: texto(u, "programa"), duracion: texto(u, "duracion"), sitioWeb: texto(u, "sitioWeb")
  }));
  const A = (n) => raiz.getAttribute(n) || "";

  // Guarda el XML original (antes de agregarle nada) para mostrarlo
  const xmlOriginal = new XMLSerializer().serializeToString(document);

  document.title = "AF02 · Intercambio académico en la FIME (XML)";

  /* ============ Encabezado, portada y datos del alumno ============ */
  const primera = unis[0];
  raiz.insertBefore(bloque(`
    <div class="ui ui-top">
      <nav class="topbar" aria-label="Principal">
        <div class="wrap topbar-in">
          <a class="brand" href="#inicio"><i class="bi bi-airplane" aria-hidden="true"></i> Intercambio <b>FIME</b></a>
          <ul class="nav">
            <li><a href="#destinos">Destinos</a></li>
            <li><a href="#xml">Archivo XML</a></li>
            <li><a href="#estructura">Estructura</a></li>
            <li><a class="nav-pia js-pia" href="#" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> PIA · AF03</a></li>
          </ul>
        </div>
      </nav>

      <header class="hero" id="inicio">
        <div class="wrap">
          <div class="inst-bar">
            <div class="inst">
              <span class="inst-badge"><img src="img/logos/uanl.png" alt="Escudo de la Universidad Autónoma de Nuevo León"/></span>
              <p><small>Universidad Autónoma</small>de Nuevo León</p>
            </div>
            <span class="inst-sep" aria-hidden="true"></span>
            <div class="inst">
              <span class="inst-badge"><img src="img/logos/fime.png" alt="Logo de la Facultad de Ingeniería Mecánica y Eléctrica"/></span>
              <p><small>Facultad de Ingeniería</small>Mecánica y Eléctrica</p>
            </div>
          </div>

          <div class="hero-grid">
            <div>
              <p class="eyebrow">AF02 · Página hecha en XML</p>
              <h1>Intercambio académico <span>desde la FIME</span></h1>
              <p class="lede">Dos destinos para estudiar un semestre fuera: uno en México y otro en Francia. Estás viendo directamente el archivo <code>index.xml</code>, con diseño de CSS.</p>

              <div class="hero-actions">
                <a class="btn btn-primary js-pia" href="#" target="_blank" rel="noopener"><i class="bi bi-folder2-open" aria-hidden="true"></i> Ir al PIA · AF03 <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>
                <form class="buscador" id="buscador" role="search" aria-label="Buscar destino">
                  <i class="bi bi-search" aria-hidden="true"></i>
                  <input id="q" type="search" list="lista-destinos" placeholder="Busca: UNAM, Francia, Lyon…" autocomplete="off" required="required" aria-label="Buscar universidad, país o ciudad"/>
                  <datalist id="lista-destinos">${datos.map((d) => [d.nombre, d.pais, d.ciudad].map((v) => `<option value="${esc(v)}"></option>`).join("")).join("")}<option value="UNAM"></option><option value="INSA Lyon"></option></datalist>
                  <button type="submit">Buscar</button>
                </form>
              </div>
            </div>

            <div class="hero-side">
              <section class="alumno" aria-label="Datos del alumno">
                <div class="alumno-head"><i class="bi bi-person-vcard" aria-hidden="true"></i> <b>Datos del alumno</b></div>
                <dl>
                  <div class="alumno-full"><dt>Nombre</dt><dd class="alumno-nombre">${esc(A("alumno"))}</dd></div>
                  <div><dt>Matrícula</dt><dd class="alumno-num">${esc(A("matricula"))}</dd></div>
                  <div><dt>Carrera</dt><dd>${esc(A("carrera"))}</dd></div>
                  <div class="alumno-full"><dt>Materia</dt><dd>${esc(A("materia"))}</dd></div>
                  <div class="alumno-full"><dt>Maestra</dt><dd>${esc(A("maestra"))}</dd></div>
                  <div><dt>Grupo</dt><dd class="alumno-num">${esc(A("grupo"))}</dd></div>
                  <div><dt>Facultad</dt><dd>${esc(A("facultad"))} · ${esc(A("universidad"))}</dd></div>
                </dl>
              </section>
              <dl class="hero-stats" aria-label="Datos leídos del XML">
                <div><dt>Etiqueta raíz</dt><dd><code>&lt;${raiz.nodeName}&gt;</code></dd></div>
                <div><dt>Universidades</dt><dd>${unis.length}</dd></div>
                <div><dt>Etiquetas por universidad</dt><dd>${ETIQUETAS.length}</dd></div>
                <div><dt>Países</dt><dd>${new Set(datos.map((d) => d.pais)).size}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </header>

      <div class="wrap sec-head" id="destinos">
        <p class="eyebrow">01 · Destinos</p>
        <h2>Dos universidades, dos pases de abordar</h2>
        <p class="sec-sub">Cada tarjeta es un elemento <code>&lt;universidad&gt;</code> del XML con sus 7 etiquetas, decorado con CSS.</p>
        <div class="filtros" role="group" aria-label="Filtrar por tipo de intercambio">
          <button type="button" class="chip" aria-pressed="true" data-f="todas"><i class="bi bi-globe-americas" aria-hidden="true"></i> Todas</button>
          <button type="button" class="chip" aria-pressed="false" data-f="nacional"><i class="bi bi-geo-alt" aria-hidden="true"></i> Nacional</button>
          <button type="button" class="chip" aria-pressed="false" data-f="internacional"><i class="bi bi-airplane" aria-hidden="true"></i> Internacional</button>
        </div>
      </div>
    </div>`), primera);

  /* ============ Decorar cada <universidad> ============ */
  datos.forEach((d) => {
    const u = d.el;
    u.insertBefore(bloque(`
      <div class="ui pase-top">
        <div class="pase-foto">
          <img src="${esc(d.foto)}" alt="Vista de ${esc(d.ciudad)}"/>
          <span class="pase-tipo tipo-${esc(d.tipo)}"><i class="bi ${d.tipo === "nacional" ? "bi-geo-alt" : "bi-airplane"}" aria-hidden="true"></i> Intercambio ${esc(d.tipo)}</span>
        </div>
        <div class="pase-ruta" aria-label="Ruta: de Monterrey a ${esc(d.ciudad)}">
          <div><b>MTY</b><small>FIME · Monterrey</small></div>
          <span class="ruta-linea" aria-hidden="true"><i class="bi bi-airplane-fill"></i></span>
          <div class="ruta-dest"><b>${esc(d.codigo)}</b><small>${esc(d.ciudad)}</small></div>
        </div>
        <div class="pase-marcas">
          <span class="pase-logo"><img src="${esc(d.logo)}" alt="Logo de ${esc(d.nombre)}"/></span>
          <img class="pase-bandera" src="${esc(d.bandera)}" alt="Bandera de ${esc(d.pais)}"/>
        </div>
      </div>`), u.firstElementChild);

    u.appendChild(bloque(`
      <div class="ui pase-acciones">
        <a class="btn btn-primary js-sitio" href="${esc(d.sitioWeb)}" target="_blank" rel="noopener" data-nombre="${esc(d.nombre)}"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Sitio oficial</a>
        <button type="button" class="btn btn-ghost js-verxml" data-id="${esc(d.id)}"><i class="bi bi-code-slash" aria-hidden="true"></i> Ver en el XML</button>
      </div>`));
  });

  /* ============ Código, estructura y pie ============ */
  const filas = ETIQUETAS.map((e, i) => `<tr><td>${i + 1}</td><td><code>&lt;${e.tag}&gt;</code></td><td><i class="bi ${e.ico}" aria-hidden="true"></i> ${e.desc}</td></tr>`).join("");
  const nodoAttrs = (el) => Array.from(el.attributes).filter((a) => ["id", "tipo", "facultad"].includes(a.name)).map((a) => ` <span class="a-attr">${a.name}="${esc(a.value)}"</span>`).join("");
  const arbol = `<li><span class="nodo nodo-raiz">&lt;${raiz.nodeName}&gt;</span>${nodoAttrs(raiz)}<ul>${unis.map((u) =>
    `<li><span class="nodo">&lt;universidad&gt;</span>${nodoAttrs(u)}<ul>${ETIQUETAS.map((e) => `<li><span class="nodo nodo-hoja">&lt;${e.tag}&gt;</span></li>`).join("")}</ul></li>`).join("")}</ul></li>`;

  const scriptEl = raiz.getElementsByTagNameNS(XHTML, "script")[0];
  raiz.insertBefore(bloque(`
    <div class="ui ui-bottom">
      <section class="sec sec-dark" id="xml" aria-label="El archivo XML">
        <div class="wrap">
          <div class="sec-head">
            <p class="eyebrow">02 · El archivo</p>
            <h2>Así se ve <code>index.xml</code></h2>
            <p class="sec-sub">Este es el código del archivo que estás viendo. Usa «Ver en el XML» en cada pase para resaltar su universidad aquí.</p>
          </div>
          <div class="code-card">
            <div class="code-bar">
              <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="code-title"><i class="bi bi-filetype-xml" aria-hidden="true"></i> index.xml</span>
              <div class="code-actions">
                <button type="button" class="btn-sm" id="btnValidar"><i class="bi bi-patch-check" aria-hidden="true"></i> Validar XML</button>
                <a class="btn-sm" href="index.xml" download="intercambio.xml"><i class="bi bi-download" aria-hidden="true"></i> Descargar</a>
              </div>
            </div>
            <pre class="code" id="xmlCode" tabindex="0"></pre>
          </div>
        </div>
      </section>

      <section class="sec" id="estructura" aria-label="Estructura">
        <div class="wrap">
          <div class="sec-head">
            <p class="eyebrow">03 · Estructura</p>
            <h2>La raíz y sus 7 etiquetas</h2>
            <p class="sec-sub">Árbol leído del documento y la función de cada etiqueta.</p>
          </div>
          <div class="estructura">
            <div class="arbol-card">
              <h3><i class="bi bi-diagram-3" aria-hidden="true"></i> Árbol del documento</h3>
              <ul class="arbol">${arbol}</ul>
            </div>
            <div class="tabla-card">
              <h3><i class="bi bi-tags" aria-hidden="true"></i> Etiquetas de cada universidad</h3>
              <table><thead><tr><th>#</th><th>Etiqueta</th><th>Qué guarda</th></tr></thead><tbody>${filas}</tbody></table>
              <p class="nota"><i class="bi bi-info-circle" aria-hidden="true"></i> Los datos del alumno y las imágenes van como <b>atributos</b> (<code>alumno</code>, <code>matricula</code>, <code>logo</code>, <code>foto</code>…), así que no cuentan como etiquetas.</p>
            </div>
          </div>
          <p class="aviso"><i class="bi bi-exclamation-circle" aria-hidden="true"></i> Los requisitos son de referencia para la actividad. Para aplicar, revisa la convocatoria de movilidad vigente de la UANL y de la FIME.</p>
        </div>
      </section>

      <footer class="footer">
        <div class="wrap footer-in">
          <div class="footer-inst">
            <img src="img/logos/uanl.png" alt=""/>
            <img src="img/logos/fime.png" alt=""/>
            <span>${esc(A("alumno"))} · ${esc(A("matricula"))} · ${esc(A("carrera"))}<br/><small>AF02 · ${esc(A("materia"))} · Grupo ${esc(A("grupo"))} · ${esc(A("maestra"))}</small></span>
          </div>
          <a class="footer-pia js-pia" href="#" target="_blank" rel="noopener">PIA · AF03 <i class="bi bi-arrow-up-right" aria-hidden="true"></i></a>
        </div>
        <div class="wrap">
          <p class="creditos">Imágenes vía Wikimedia Commons: Biblioteca Central de la UNAM (Carlos Valenzuela, CC BY-SA 4.0), panorama de Lyon (Zairon, CC BY-SA 3.0), escudo UNAM y logo INSA Lyon (dominio público). Banderas: flagcdn.com.</p>
        </div>
      </footer>
    </div>`), scriptEl);

  /* ============ ALERTAS ============ */

  // 1) Botones del PIA
  $$(".js-pia").forEach((a) => {
    a.setAttribute("href", PIA_URL);
    a.addEventListener("click", (ev) => {
      if (!confirm("Vas a ir a la página de nuestro PIA (AF03 · Equipo 1).\n\n¿Quieres continuar?")) ev.preventDefault();
    });
  });

  // 2) Sitio oficial y «Ver en el XML»
  document.addEventListener("click", (ev) => {
    const sitio = ev.target.closest(".js-sitio");
    if (sitio && !confirm(`Vas a salir de esta página para visitar el sitio oficial de:\n${sitio.dataset.nombre}\n\n¿Continuar?`)) { ev.preventDefault(); return; }
    const ver = ev.target.closest(".js-verxml");
    if (ver) {
      const b = document.getElementById("xml-" + ver.dataset.id);
      if (b) { b.scrollIntoView(scrollOpts); b.classList.remove("activo"); void b.getBoundingClientRect(); b.classList.add("activo"); }
    }
  });

  // 3) Filtro nacional / internacional
  const chips = $$(".chip");
  chips.forEach((ch) => ch.addEventListener("click", () => {
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === ch)));
    datos.forEach((d) => {
      if (ch.dataset.f !== "todas" && d.tipo !== ch.dataset.f) d.el.setAttribute("oculta", "si");
      else d.el.removeAttribute("oculta");
    });
  }));

  // 4) Buscador
  $("#buscador").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const raw = $("#q").value.trim();
    const q = normal(raw);
    if (!q) return;
    const d = datos.find((x) => normal([x.nombre, x.pais, x.ciudad, x.id, x.codigo, x.tipo, x.programa].join(" ")).includes(q));
    if (!d) {
      alert(`No encontré "${raw}" en el XML.\n\nDestinos disponibles:\n${datos.map((x) => `• ${x.nombre} (${x.ciudad}, ${x.pais})`).join("\n")}`);
      return;
    }
    if (confirm(`Destino encontrado: ${d.nombre}\n${d.ciudad}, ${d.pais} · Intercambio ${d.tipo}\nDuración: ${d.duracion}\n\n¿Quieres ir a su sitio oficial?\n${d.sitioWeb}`)) {
      window.open(d.sitioWeb, "_blank", "noopener");
    } else {
      chips[0].click();
      d.el.scrollIntoView(scrollOpts);
      d.el.classList.remove("destacar"); void d.el.getBoundingClientRect(); d.el.classList.add("destacar");
    }
  });

  // 5) Validar el XML
  $("#btnValidar").addEventListener("click", () => {
    const doc = new DOMParser().parseFromString(xmlOriginal, "application/xml");
    const err = doc.getElementsByTagName("parsererror")[0];
    if (err) { alert("El XML NO está bien formado:\n\n" + err.textContent.slice(0, 200)); return; }
    const r = doc.documentElement;
    const us = Array.from(r.getElementsByTagName("universidad"));
    const detalle = us.map((u) => `• ${u.getAttribute("id")}: ${u.children.length} etiquetas (${Array.from(u.children).map((c) => c.nodeName).join(", ")})`).join("\n");
    alert(`El XML está bien formado.\n\nEtiqueta raíz: <${r.nodeName}>\nUniversidades: ${us.length}\n\n${detalle}`);
  });

  /* ============ Mostrar el código XML con colores ============ */
  function colorear(src) {
    return src.split(/(<!--[\s\S]*?-->)/g).map((parte, i) => (i % 2
      ? `<span class="t-cmt">${esc(parte)}</span>`
      : esc(parte)
          .replace(/(&lt;\?[\s\S]*?\?&gt;)/g, '<span class="t-pro">$1</span>')
          .replace(/(&lt;\/?)([\w:.-]+)((?:\s+[\w:.-]+=&quot;[^&]*?&quot;)*)\s*(\/?&gt;)/g, (m, a, name, attrs, b) =>
            `<span class="t-tag">${a}${name}</span>` +
            attrs.replace(/(\s+)([\w:.-]+)=(&quot;[^&]*?&quot;)/g, '$1<span class="t-attr">$2</span>=<span class="t-val">$3</span>') +
            `<span class="t-tag">${b}</span>`)
    )).join("");
  }

  function pintarCodigo(src) {
    const html = colorear(src).replace(
      /(<span class="t-tag">&lt;universidad<\/span>[\s\S]*?<span class="t-attr">id<\/span>=<span class="t-val">&quot;([\w-]+)&quot;<\/span>[\s\S]*?<span class="t-tag">&lt;\/universidad<\/span><span class="t-tag">&gt;<\/span>)/g,
      (m, b, id) => `<span class="xml-bloque" id="xml-${id}">${b}</span>`);
    const pre = $("#xmlCode");
    while (pre.firstChild) pre.removeChild(pre.firstChild);
    const frag = h(html);
    while (frag.firstChild) pre.appendChild(frag.firstChild);
  }

  // Se pide el archivo tal cual (con sus espacios); si falla, se usa la copia en memoria
  fetch(location.href.split("#")[0])
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then(pintarCodigo)
    .catch(() => pintarCodigo(xmlOriginal));
})();
