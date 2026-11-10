const groups = ['Waste collection', 'Drain & road cleaning', 'Trailers & tankers', 'Public sanitation', 'Municipal infrastructure'];
const params = new URLSearchParams(location.search);
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const cards = [...document.querySelectorAll("[data-group]")];
const categories = [...document.querySelectorAll("[data-catalogue-group]")];
function filter(group) {
  let shown = 0;
  for (const card of cards) {
    card.hidden = Boolean(group && card.dataset.group !== group);
    if (!card.hidden) shown++;
  }
  for (const category of categories) category.hidden = Boolean(group && category.dataset.catalogueGroup !== group);
  for (const button of filterButtons) button.setAttribute("aria-pressed", String(button.dataset.filter === group));
  document.querySelector("#result-count").textContent = shown + (shown === 1 ? " item" : " items");
}
if (filterButtons.length) {
  filter(groups[params.get("group")] || "");
  for (const button of filterButtons) button.addEventListener("click", () => filter(button.dataset.filter));
}
const enquiry = document.querySelector("#equipment-enquiry");
if (enquiry) {
  const fields = enquiry.elements;
  const type = fields.namedItem("type");
  const product = fields.namedItem("product");
  const tender = document.querySelector("#tender-fields");
  const salesEmail = document.querySelector(".email");
  const salesAddress = salesEmail.getAttribute("href");
  const labels = {
    general: "General product enquiry",
    gem: "GeM bid",
    tender: "Other government tender",
  };

  const productId = params.get("product");
  if (productId && [...product.options].some((option) => option.value === productId)) {
    product.value = productId;
  }
  function updateTenderFields() {
    const general = type.value === "general";
    const referenceLabel = type.value === "gem" ? "GeM bid number" : "Tender reference";
    tender.hidden = general;
    tender.disabled = general;
    document.querySelector("#tender-legend").textContent = type.value === "gem" ? "GeM bid details" : "Tender details";
    document.querySelector("#reference-label").textContent = referenceLabel;
  }
  function updateSalesLink() {
    const selected = product.selectedOptions[0];
    const subject = selected.value ? "?subject=" + encodeURIComponent("Equipment enquiry: " + selected.text) : "";
    salesEmail.href = salesAddress + subject;
  }

  updateTenderFields();
  updateSalesLink();
  enquiry.hidden = false;
  type.addEventListener("change", updateTenderFields);
  product.addEventListener("change", updateSalesLink);
  enquiry.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(enquiry);
    const subject = labels[type.value] + " — " + product.selectedOptions[0].text;
    const entries = [
      ["Name", data.get("name")],
      ["Organisation or department", data.get("organisation")],
      ["Email", data.get("email")],
      ["Phone", data.get("phone")],
      ["Quantity", data.get("quantity")],
      ["Delivery city and state", data.get("location")],
      [type.value === "gem" ? "GeM bid number" : "Tender reference", data.get("reference")],
      ["Submission deadline", data.get("deadline")],
      ["Requirement details", data.get("details")],
    ];
    const body = entries.filter(([, value]) => value?.trim()).map(([label, value]) => label + ": " + value.trim()).join("\r\n");
    location.href = salesAddress + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  });
}

// Keep depth effects on precise pointers and respect reduced-motion settings.
const allowTilt = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
for (const surface of document.querySelectorAll(".product, .hero-photo, .about figure, .contact-card")) {
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


// Animate once as a section enters view. Content is visible without scripting.
if ("IntersectionObserver" in window && matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  const arrivals = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      entry.target.classList.add("scroll-arrived");
      entry.target.addEventListener("animationend", () => {
        entry.target.classList.remove("scroll-arrived");
      }, { once: true });
    }
  }, { threshold: 0.12 });

  const sections = document.querySelectorAll(
    ".editorial-heading, .info-card, .section-head, .category-band, .equipment-category > h2, .product, .about, .gallery"
  );
  for (const section of sections) arrivals.observe(section);
}
