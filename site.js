const groups = ['Waste collection', 'Drain & road cleaning', 'Trailers & tankers', 'Public sanitation'];
const products = ['Hopper tipper dumper', 'Trailer-mounted suction machine', 'Suction and jetting machine', 'Trailer-mounted road sweeper', 'Agricultural trailer', 'Trailer-mounted tanker', 'Stainless-steel sanitation cabins', 'Mobile toilet unit', 'Stainless-steel litter bins'];
const params = new URLSearchParams(location.search);
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const cards = [...document.querySelectorAll("[data-group]")];
function filter(group) {
  let shown = 0;
  for (const card of cards) {
    card.hidden = Boolean(group && card.dataset.group !== group);
    if (!card.hidden) shown++;
  }
  for (const button of filterButtons) button.setAttribute("aria-pressed", String(button.dataset.filter === group));
  document.querySelector("#result-count").textContent = shown + (shown === 1 ? " item" : " items");
}
if (filterButtons.length) {
  filter(groups[params.get("group")] || "");
  for (const button of filterButtons) button.addEventListener("click", () => filter(button.dataset.filter));
}
const product = products[params.get("product")];
const selected = document.querySelector("#selected-product");
if (selected && product) {
  selected.textContent = "Selected equipment: " + product;
  selected.hidden = false;
  document.querySelector(".email").href += "?subject=" + encodeURIComponent("Equipment enquiry: " + product);
}

// Keep depth effects on precise pointers and respect reduced-motion settings.
const allowTilt = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
for (const surface of document.querySelectorAll(".product, .hero-photo")) {
  surface.addEventListener("pointermove", (event) => {
    if (!allowTilt.matches || event.pointerType === "touch") return;
    const bounds = surface.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    surface.style.setProperty("--tilt-x", (-y * 7).toFixed(2) + "deg");
    surface.style.setProperty("--tilt-y", (x * 7).toFixed(2) + "deg");
  });
  surface.addEventListener("pointerleave", () => {
    surface.style.removeProperty("--tilt-x");
    surface.style.removeProperty("--tilt-y");
  });
}
