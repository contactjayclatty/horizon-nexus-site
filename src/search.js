// Site search: loads a small index built at build time and filters it in the browser. No services.
const input = document.querySelector("[data-search-input]");
const list = document.querySelector("[data-search-results]");
const status = document.querySelector("[data-search-status]");
if (input && list && status) {
  let index = [];
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const snippet = (x, term) => { const i = x.toLowerCase().indexOf(term); const start = Math.max(0, i - 60); return (start ? "..." : "") + x.slice(start, start + 180) + "..."; };
  const run = () => {
    const q = input.value.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    if (!terms.length) { list.innerHTML = ""; status.textContent = "Type to search."; return; }
    const hits = index.map((p) => { const hay = `${p.t} ${p.d} ${p.x}`.toLowerCase(); if (!terms.every((t) => hay.includes(t))) return null; const score = terms.reduce((n, t) => n + (p.t.toLowerCase().includes(t) ? 10 : 0) + hay.split(t).length, 0); return { p, score }; }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 12);
    status.textContent = hits.length ? `${hits.length} result${hits.length === 1 ? "" : "s"}` : "No results. Try a shorter word.";
    list.innerHTML = hits.map(({ p }) => `<li><a href="${p.u}"><b>${esc(p.t)}</b><span>${esc(snippet(p.x, terms[0]))}</span></a></li>`).join("");
  };
  status.textContent = "Loading...";
  fetch(input.dataset.index).then((r) => r.json()).then((d) => { index = d; const q = new URLSearchParams(location.search).get("q"); if (q) input.value = q; run(); }).catch(() => { status.textContent = "Search could not load. Try the docs instead."; });
  input.addEventListener("input", run);
}
