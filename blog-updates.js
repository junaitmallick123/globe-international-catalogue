const updateList = document.querySelector("#pib-updates");
const updateStatus = document.querySelector("#pib-status");
const pibFeed = "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1";
const topics = /swachh bharat|solid waste|waste management|sanitation|sewerage|municipal|urban local bod(?:y|ies)/i;

function officialLink(value) {
  try {
    const link = new URL(value);
    return link.protocol === "https:" && ["pib.gov.in", "www.pib.gov.in"].includes(link.hostname) ? link.href : "";
  } catch {
    return "";
  }
}

async function loadPibUpdates() {
  const endpoint = new URL("https://api.rss2json.com/v1/api.json");
  endpoint.searchParams.set("rss_url", pibFeed);
  try {
    const response = await fetch(endpoint, {
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(7000)
    });
    if (!response.ok) throw new Error("Feed request failed");
    const data = await response.json();
    if (data.status !== "ok" || !Array.isArray(data.items)) throw new Error("Invalid feed");

    const entries = [];
    const seen = new Set();
    for (const item of data.items) {
      const title = typeof item?.title === "string" ? item.title.trim() : "";
      const href = officialLink(item?.link);
      if (!href || seen.has(href) || !topics.test(title)) continue;

      const entry = document.createElement("li");
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.textContent = title;
      entry.append(anchor);
      entries.push(entry);
      seen.add(href);
      if (entries.length === 5) break;
    }
    if (entries.length) {
      updateList.replaceChildren(...entries);
      updateStatus.textContent = "Recent announcements from PIB.";
    } else {
      updateStatus.textContent = "No matching announcements in the latest feed. Browse the selected resources below.";
    }
  } catch {
    updateStatus.textContent = "The live feed is unavailable. Browse the selected PIB resources below.";
  }
}

loadPibUpdates();
