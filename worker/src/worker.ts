import { Liquid } from "liquidjs";
import aboutTemplate from "../../templates/liquid/about.liquid";
import communityPartnersTemplate from "../../templates/liquid/community-partners.liquid";
import contactTemplate from "../../templates/liquid/contact-us.liquid";
import donationTemplate from "../../templates/liquid/donation-request.liquid";
import eventsTemplate from "../../templates/liquid/events.liquid";
import formFeedback from "../../templates/liquid/partials/form-feedback.liquid";
import menuCategoryTemplate from "../../templates/liquid/partials/menu-category.liquid";
import homeTemplate from "../../templates/liquid/home.liquid";
import layoutTemplate from "../../templates/liquid/layout.liquid";
import menuTemplate from "../../templates/liquid/menu.liquid";

type Fetcher = { fetch(request: Request): Promise<Response> };
type R2Object = { body: ReadableStream; httpMetadata?: { contentType?: string } };
type R2Bucket = { get(key: string): Promise<R2Object | null> };
type D1Database = { prepare(query: string): { bind(...values: string[]): { run(): Promise<unknown> } } };
type Env = { ASSETS: Fetcher | R2Bucket; STATIC: Fetcher; TEMPLATES: Fetcher; DB?: D1Database };
type Submission = { formType: string; submittedAt: string; payload: Record<string, string> };

const submissions: Submission[] = [];
const assetCacheControl = "public, max-age=604800, s-maxage=31536000";
const siteUrl = "https://lewandowskismarket.com";
const seo = {
  "/": { title: "Polish Market, Homemade Kielbasa & Fresh Meats | Lewandoski's Market", description: "Lewandoski's Market is a Grand Rapids Polish market offering fresh cuts, homemade kielbasa, Polish grocery staples, and prepared foods.", image: "/assets/img/video_poster.jpg" },
  "/about": { title: "About Lewandoski's Market | Grand Rapids, MI", description: "Learn the history of Lewandoski's Market and its Polish food traditions on Grand Rapids' West Side.", image: "/assets/img/about_page_left_2.jpg" },
  "/products-specialties-gifts": { title: "Fresh Sausage, Meats & Polish Grocery | Lewandoski's Market", description: "Explore fresh sausage, butcher-cut meats, homemade foods, Polish grocery staples, breads, desserts, and gifts in Grand Rapids.", image: "/assets/img/food_back_new.jpg" },
  "/events": { title: "Events | Lewandoski's Market, Grand Rapids", description: "Find upcoming news and events from Lewandoski's Market on Grand Rapids' West Side.", image: "/assets/img/events_back_new.jpg" },
  "/community-partners": { title: "Community Partners | Lewandoski's Market", description: "Meet the Grand Rapids organizations and community partners supported by Lewandoski's Market.", image: "/assets/img/community_partners_back.jpg" },
  "/donation-request": { title: "Donation Requests | Lewandoski's Market", description: "Submit a donation request to Lewandoski's Market for a Grand Rapids nonprofit or community event.", image: "/assets/img/donation_request_back.jpg" },
  "/contact-us": { title: "Contact & Hours | Lewandoski's Market, Grand Rapids", description: "Visit Lewandoski's Market at 1107 Walker Ave NW in Grand Rapids for Polish grocery favorites, fresh meats, and homemade sausage.", image: "/assets/img/about_back_2.jpg" },
} as const;
// TODO: Expand each category with verified in-house offerings, current product brands, seasonal availability, and local Grand Rapids purchase guidance.
// TODO: Add confirmed parking, accessibility, holiday-ordering, and Google Business Profile details to the relevant customer-facing pages.
const categoryCopy: Record<string, string> = {
  sausage: "Lewandoski's Market has long been a destination for fresh and smoked kielbasa, Krakowska, and house-made sausage in Grand Rapids. Visit our West Side market for traditional Polish flavors, everyday grilling favorites, and help choosing the right sausage for your next meal.",
  meats: "Our butcher case features fresh cuts selected for weeknight dinners, weekend grilling, and family gatherings. Stop in to see today's selection of burgers, steaks, roasts, and other fresh meats, or ask our team for a recommendation.",
  "homemade-foods": "Take home comforting prepared foods made with the same care we bring to our market counter. Our homemade favorites make it easier to put a satisfying meal on the table, whether you are planning a family dinner or picking up a side for a gathering.",
  "polish-grocery": "Explore Polish grocery staples, pantry favorites, pierogi, and specialty ingredients in the heart of Grand Rapids' West Side. Our shelves offer familiar flavors for longtime customers and an easy introduction to Polish cooking for new visitors.",
  "gift-cards-and-gifts": "Find thoughtful gifts for food lovers, neighborhood regulars, and anyone who appreciates Lewandoski's Market traditions. Gift cards and market merchandise make it simple to share a favorite local destination with friends and family.",
  "breads-and-desserts": "Round out your table with breads, desserts, and sweet Polish favorites. Visit the market to discover today's selection and find something special for everyday meals, holidays, and family celebrations.",
};
const menu = [
  { slug: "sausage", name: "Sausage", description: "Fresh and smoked Kielbasa, Krakowska, and a premium selection of house-made sausage built on time-honored methods.", items: [["Fresh Kielbasa", "/assets/img/feb9c6602c164b05bdd77d1ebe94979c.jpeg", "Our classic fresh Kielbasa is seasoned and prepared in-house for your next family meal."], ["Smoked sausage", "/assets/img/b40961b50a8c40448e2f4c8505227745.jpeg", "A richly flavored smoked sausage made with time-honored recipes."], ["Homemade sausage", "/assets/img/2b5781b091304453bfb026d0a3b9112d.jpeg", "A selection of handcrafted sausage made fresh for the butcher case."]] },
  { slug: "meats", name: "Meats", description: "Fresh-cut meats selected to make everyday dinners and special occasions memorable.", items: [["Fresh burger patties", "/assets/img/344b9b3c8a20412eabc0cb981c2ad59c.jpeg", "Fresh-ground burger patties ready for the grill, skillet, or your favorite recipe."], ["Fresh meat selection", "/assets/img/8e798e9ab03f44aab4466591e2e41429.jpeg", "Quality cuts and specialty meats for everyday dinners and special occasions."]] },
  { slug: "homemade-foods", name: "Homemade Foods", description: "Comforting prepared favorites made with the same care we bring to our butcher case.", items: [["Homemade salad", "/assets/img/604ced1931264f66a426544777bca76f.jpeg", "Prepared favorites made in small batches for an easy side dish."], ["Kapusta and sausage", "/assets/img/853e39c44ed3495095a780ad8737fd57.jpeg", "A Polish comfort-food favorite with savory sausage and tangy cabbage."], ["Prepared cheese spread", "/assets/img/229debd433e64bb6bd39fe10df52bd6a.jpeg", "A ready-to-share deli favorite for crackers, sandwiches, and party trays."]] },
  { slug: "polish-grocery", name: "Polish Grocery", description: "Polish pantry staples, specialty ingredients, and familiar flavors for your table.", items: [["Polish grocery and pierogi case", "/assets/img/c32f783993ad438ca0938aade9178ed2.jpeg", "A well-stocked selection of pierogi, Polish staples, and market favorites."]] },
  { slug: "gift-cards-and-gifts", name: "Gift Cards & Gifts", description: "Thoughtful gifts for the food lovers and Lewandoski's regulars in your life.", items: [["Lewandoskis Market merchandise", "/assets/img/gallery/f8b7bdf209434584b37c8fbd2f52ebcb.jpeg", "Market merchandise and gifts for loyal West Side food lovers."]] },
  { slug: "breads-and-desserts", name: "Breads & Desserts", description: "Sweet and savory bakery favorites to round out any meal.", items: [["Fresh baked bread", "/assets/img/gallery/5b1ed2d1d813474a84469fd9e5290031.jpeg", "Fresh bread and bakery favorites to complete a meal."], ["Kremowki dessert", "/assets/img/gallery/03b659a561074e7ba76ed6e7cf62a9ca.jpeg", "A classic Polish pastry with delicate layers and a rich, creamy filling."]] },
].map(category => ({ ...category, copy: categoryCopy[category.slug], images: category.items.map(([alt, src, description]) => ({ alt, src, description })) }));

const gallery = [
  ["Cheese Spread", "d0671e8f98e0417d821ac42620539198", true], ["Gołąbki", "b335e7b1f14e7ea478bcb14aeb7f4d"], ["Brats", "57566a9c4f5c40f6bfee99fdf56abb45"], ["Old picture", "58aa2baa662d482e98ca00a01f84f42d"], ["Lewandoskis Market exterior", "bfa9b02970ff4f68b9f7416b44c3b576"], ["Old picture of the market", "31683db2b6cb4a8b87b7519f9cb1a074"], ["Charcuterie board with cheeses and cured meats", "311b147de93440249c03086a5d8d0494"], ["Staff member posing for a photo", "c8fe361e9f784f01bbb95fdf33e90683", true], ["Steak", "349921811b7b4f579c2115a95eb9bb21"], ["Exterior of the restaurant", "1ec97e80d3714743bf1dc2bd8a011e96"], ["Kapusta", "0393b163d7f941bb9542633e86ee2524"], ["Fresh Baked Bread", "5b1ed2d1d813474a84469fd9e5290031"], ["Interior, shelf with different products", "2221484751614805a650467b9031451f"], ["Owner and an employee", "1859c42d87a64a11acb2ad02901d1c8f"], ["Merchandise t-shirts", "f8b7bdf209434584b37c8fbd2f52ebcb", true], ["Meatballs", "307a500fa60b4130b991cba414dab3fa"], ["Baked Beans", "8514655a5ad7461a9b17b14d8339d608"], ["Lewandoskis Market", "6f8c81e4f66a488589b11d58b552cbf2"], ["Pickled products", "f16979b2793d4f1999d1c9c216e18862"], ["T-bone steak", "aa861fbeb51341b89e87df1c99373abc"], ["Bacon", "8887a886246d4ec88889176c55599145"], ["Interior, display fridges area", "c0c56128f51442a59771852de159db92", true], ["Sausages", "52a2d8d4bb5440a982fb20eb3f745f88"], ["Various Groceries", "b0864451e6a74a6db4cc26a14a1d1bf2"], ["Shelf with different products", "a3553a4935124abe9b4f30048be01c44"], ["Trophies on the shelf", "11e94e31e09f492c9dfd4e272384fe94"], ["Kremowki", "03b659a561074e7ba76ed6e7cf62a9ca"], ["Freshly smoked kielbasa hanging from smoker sticks", "99cba26e801f4302aa18c812e5e4d8ee"],
].map(([title, image, wide]) => ({ title, image: `/assets/img/gallery/${image}.jpeg`, wide: Boolean(wide), maxWidth: image === "349921811b7b4f579c2115a95eb9bb21" ? 480 : 1024 }));

const pages = {
  "/about": { title: "About", eyebrow: "Our story", heading: "Lewandoski's Market", intro: "Polish heritage and neighborhood tradition on Grand Rapids' West Side.", image: "/assets/img/about_1_new.jpg", sections: [{ title: "100 years on the West Side", body: "Our market has been a fixture on Grand Rapids' West Side since 1923 and came into its own in 1948, thanks to the man we call Uncle Ray. From a family of meat market owners, Ray Lewandoski gave everything to his store to offer neighbors the highest-quality products for everyday meals." }, { title: "Keeping the recipes alive", body: "Our roots run deep. We continue to make incomparable fresh and smoked Kielbasa and Krakowska, while sharing favorites like pierogies, kapusta, Italian sausage, and chorizo." }, { title: "Stewards of a staple", body: "Owners and brothers Gary and Roger Szotko grew up visiting Lewandoski's. Today they preserve its history and Polish heritage while helping it grow throughout West Michigan." }] },
  "/community-partners": { title: "Community Partners", eyebrow: "Our neighborhood", heading: "Proud to stand with our community.", intro: "The West Side is stronger when local people and organizations show up for one another.", image: "/assets/img/community_partners_back.jpg", partners: [{ name: "Fans of Valley Field", body: "A grassroots effort to restore and revitalize historic Sullivan Field on Grand Rapids' West Side.", url: "https://www.fansofvalleyfield.org" }, { name: "Saint Francis Sculpture Garden", body: "A free, accessible outdoor nature trail with 17 bronze statues across 11 acres of natural beauty.", url: "https://www.saintfrancissculpturegarden.org" }, { name: "Steepletown Neighborhood Services", body: "Creating opportunities through education, workforce development, and community empowerment.", url: "https://steepletown.org" }, { name: "Enriched Living", body: "A family-run nonprofit providing licensed adult foster care homes for adults with disabilities in West Michigan.", url: "https://enrichedlivingmichigan.org/" }] },
  "/events": { title: "Events", eyebrow: "What's happening", heading: "Events are coming soon.", intro: "We are updating our events calendar. Please stay tuned and follow us on Facebook for the latest market news.", image: "/assets/img/events_back_new.jpg" },
};

const liquid = new Liquid();
const templates: Record<string, string> = {
  "about.liquid": aboutTemplate,
  "community-partners.liquid": communityPartnersTemplate,
  "contact-us.liquid": contactTemplate,
  "donation-request.liquid": donationTemplate,
  "events.liquid": eventsTemplate,
  "layout.liquid": layoutTemplate,
  "home.liquid": homeTemplate,
  "menu.liquid": menuTemplate,
  "partials/menu-category.liquid": menuCategoryTemplate,
  "partials/form-feedback.liquid": formFeedback,
};

async function renderTemplate(_env: Env, name: string, context: Record<string, unknown>) {
  const source = templates[name];
  if (!source) throw new Error(`Missing shared template: ${name}`);
  return liquid.parseAndRender(source, context);
}

async function renderPage(env: Env, name: string, context: Record<string, unknown>, currentPath: string, hostname: string) {
  const content = await renderTemplate(env, name, context);
  const category = currentPath.startsWith("/products/") ? menu.find(item => item.slug === currentPath.slice("/products/".length)) : undefined;
  const metadata = category ? { title: `${category.name} | Lewandoski's Market, Grand Rapids`, description: `${category.description} Visit Lewandoski's Market on Grand Rapids' West Side.`, image: category.images[0]?.src ?? "/assets/img/food_back_new.jpg" } : seo[currentPath as keyof typeof seo] ?? seo["/"];
  return renderTemplate(env, "layout.liquid", { ...context, content, currentPath, canonicalUrl: `${siteUrl}${currentPath}`, metadata, noindex: hostname !== "lewandowskismarket.com" && hostname !== "www.lewandowskismarket.com" });
}

const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
const html = (title: string, body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} | Lewandoski's Market</title><link rel="stylesheet" href="/static/css/site.css"><script src="/static/vendor/htmx-4.0.0.js"></script></head><body><header class="site-header"><div class="site-logo-row"><div class="shell relative"><a class="site-logo-link" href="/"><img class="site-logo" src="/assets/img/logo_2.png" alt="Lewandoski's Market"></a></div></div><nav class="site-nav"><a href="/about">About Us</a><a href="/products-specialties-gifts">Products</a><a href="/events">Events</a><a href="/community-partners">Community</a><a href="/contact-us">Contact Us</a></nav></header><main id="content">${body}</main></body></html>`;

function menuNavigation(selected: typeof menu[number]) {
  return `<nav id="menu-category-nav" class="flex flex-wrap justify-center gap-3" aria-label="Menu categories">${menu.map(category => `<a class="button-menu${category.slug === selected.slug ? " !bg-market-cream !text-market-ink" : ""}" href="?category=${category.slug}" hx-get="/products-specialties-gifts?category=${category.slug}" hx-target="#menu-category" hx-swap="outerHTML" hx-push-url="true" data-category="${category.slug}"${category.slug === selected.slug ? " aria-current=\"page\"" : ""}>${category.name}</a>`).join("")}</nav>`;
}

function menuCategory(selected: typeof menu[number]) {
  return `<section id="menu-category" data-selected-category="${selected.slug}" class="border-t-2 border-market-red pt-8"><div class="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><div><h2 class="section-title text-4xl">${selected.name}</h2><p class="mt-5 text-lg leading-8">${selected.description}</p></div><div class="grid gap-5 sm:grid-cols-2">${selected.items.map(([name, src, description]) => `<article class="border border-market-red/25 bg-white p-3"><img class="aspect-[4/3] w-full object-cover" src="${src}" alt="${name}"><h3 class="mt-4 font-display text-2xl uppercase text-market-red">${name}</h3><p class="mt-2 leading-7">${description}</p><a class="button mt-5" href="/contact-us">Ask About Availability</a></article>`).join("")}</div></div></section>`;
}

function formPage(type: "contact" | "donation") {
  const donation = type === "donation";
  const fields = donation ? ["name", "email", "phone", "organization", "event_name", "event_date", "guest_count", "items_requested"] : ["first_name", "last_name", "email", "phone", "message"];
  return html(donation ? "Donation Request" : "Contact Us", `<section class="page-hero"><img src="/assets/img/${donation ? "donation_request_back.jpg" : "about_back_2.jpg"}" alt=""><div class="shell relative"><h1 class="hero-title mx-auto">${donation ? "Donation Request" : "Contact Us"}</h1></div></section><section class="paper-section"><div class="form-panel"><div id="form-feedback" aria-live="polite"></div><form method="post" action="/forms/${type}" hx-post="/forms/${type}" hx-target="#form-feedback" hx-swap="innerHTML">${fields.map(field => `<label class="form-label">${field.replaceAll("_", " ")}<input class="field" name="${field}"${field === "email" ? " type=\"email\"" : ""} required></label>`).join("")}<button class="button mt-5" type="submit">Submit</button></form></div></section>`);
}

async function handleSubmission(request: Request, env: Env, type: "contact" | "donation") {
  const payload = Object.fromEntries([...((await request.formData()).entries())].map(([key, value]) => [key, String(value).trim()]));
  const required = type === "contact" ? ["first_name", "last_name", "email", "message"] : ["name", "email", "phone", "organization", "event_name", "event_date", "guest_count", "items_requested"];
  const missing = required.filter(field => !payload[field]);
  if (missing.length) return new Response(await renderTemplate(env, "partials/form-feedback.liquid", { error: `Please complete: ${missing.map(field => field.replaceAll("_", " ")).join(", ")}.`, invalidFields: missing }), { headers: { "content-type": "text/html" } });
  const submittedAt = new Date().toISOString();
  if (env.DB) {
    await env.DB.prepare("INSERT INTO submissions (form_type, submitted_at, payload) VALUES (?, ?, ?)")
      .bind(type, submittedAt, JSON.stringify(payload))
      .run();
  } else {
    submissions.push({ formType: type, submittedAt, payload });
  }
  if (request.headers.get("HX-Request") === "true") return new Response(await renderTemplate(env, "partials/form-feedback.liquid", { success: "Thank you. Your request has been received and our team will be in touch soon." }), { headers: { "content-type": "text/html" } });
  return Response.redirect(new URL(type === "contact" ? "/contact-us?submitted=1" : "/donation-request?submitted=1", request.url), 303);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/robots.txt") return new Response(`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`, { headers: { "content-type": "text/plain" } });
    if (url.pathname === "/sitemap.xml") {
      const paths = [...Object.keys(seo), ...menu.map(category => `/products/${category.slug}`)].map(path => `<url><loc>${siteUrl}${path}</loc></url>`).join("");
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths}</urlset>`, { headers: { "content-type": "application/xml" } });
    }
    if (url.pathname.startsWith("/assets/")) {
      if ("fetch" in env.ASSETS) {
        const response = await env.ASSETS.fetch(new Request(new URL(url.pathname.slice(7), request.url), request));
        const headers = new Headers(response.headers);
        headers.set("cache-control", assetCacheControl);
        return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
      }
      const object = await env.ASSETS.get(url.pathname.slice(1));
      if (!object) return new Response("Not found", { status: 404 });
      return new Response(object.body, { headers: { "cache-control": assetCacheControl, "content-type": object.httpMetadata?.contentType ?? "application/octet-stream" } });
    }
    if (url.pathname === "/llms.txt") return env.STATIC.fetch(new Request(new URL("llms.txt", request.url), request));
    if (url.pathname.startsWith("/static/")) return env.STATIC.fetch(new Request(new URL(url.pathname.slice(7), request.url), request));
    if (url.pathname === "/forms/contact" && request.method === "POST") return handleSubmission(request, env, "contact");
    if (url.pathname === "/forms/donation" && request.method === "POST") return handleSubmission(request, env, "donation");
    if (url.pathname === "/products-specialties-gifts" || url.pathname.startsWith("/products/")) {
      const slug = url.pathname.startsWith("/products/") ? url.pathname.slice("/products/".length) : url.searchParams.get("category");
      const selected = menu.find(category => category.slug === slug) ?? menu[0];
      const context = { title: "Products", menu, selected };
      const name = request.headers.get("HX-Request") === "true" ? "partials/menu-category.liquid" : "menu.liquid";
      const output = request.headers.get("HX-Request") === "true" ? await renderTemplate(env, name, context) : await renderPage(env, name, context, url.pathname, url.hostname);
      return new Response(output, { headers: { "content-type": "text/html" } });
    }
    if (url.pathname === "/contact-us" || url.pathname === "/donation-request") {
      const donation = url.pathname === "/donation-request";
      const names = donation ? ["name", "email", "phone", "organization", "event_name", "event_date", "guest_count", "items_requested"] : ["first_name", "last_name", "email", "phone", "message"];
      const context = { title: donation ? "Donation Request" : "Contact Us", product: donation ? null : url.searchParams.get("product"), fields: names.map(name => ({ name, label: name.replaceAll("_", " "), type: name === "email" ? "email" : name === "phone" ? "tel" : name === "event_date" ? "date" : "", autocomplete: ({ first_name: "given-name", last_name: "family-name", email: "email", phone: "tel", organization: "organization" } as Record<string, string>)[name] ?? "off" })) };
      return new Response(await renderPage(env, donation ? "donation-request.liquid" : "contact-us.liquid", context, url.pathname, url.hostname), { headers: { "content-type": "text/html" } });
    }
    if (url.pathname === "/") return new Response(await renderPage(env, "home.liquid", { title: "Home", gallery }, url.pathname, url.hostname), { headers: { "content-type": "text/html" } });
    const page = pages[url.pathname];
    if (page) {
      const template = { "/about": "about.liquid", "/community-partners": "community-partners.liquid", "/events": "events.liquid" }[url.pathname]!;
      return new Response(await renderPage(env, template, { title: page.title, partners: "partners" in page ? page.partners : [] }, url.pathname, url.hostname), { headers: { "content-type": "text/html" } });
    }
    return new Response("Not found", { status: 404 });
  },
};
