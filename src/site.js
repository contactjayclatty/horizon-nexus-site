// Phone menu and the short reveal motion. No dependencies.
const button = document.querySelector("[data-menu-button]");
const menu = document.getElementById("menu");
if (button && menu) {
  const set = (open) => {
    button.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    button.querySelector("[data-label]").textContent = open ? "Close" : "Menu";
  };
  button.addEventListener("click", () => set(button.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && button.getAttribute("aria-expanded") === "true") { set(false); button.focus(); } });
  matchMedia("(min-width: 901px)").addEventListener("change", (e) => { if (e.matches) set(false); });
}
const items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver((entries) => entries.forEach((en, i) => {
    if (en.isIntersecting) { en.target.style.transitionDelay = `${Math.min(i, 6) * 40}ms`; en.target.classList.add("in"); io.unobserve(en.target); }
  }), { rootMargin: "0px 0px -40px 0px" });
  items.forEach((el) => io.observe(el));
} else items.forEach((el) => el.classList.add("in"));
