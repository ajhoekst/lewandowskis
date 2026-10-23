import { Liquid } from "liquidjs";
import formFeedback from "../../templates/liquid/partials/form-feedback.liquid";
import menuCategoryTemplate from "../../templates/liquid/partials/menu-category.liquid";
import formTemplate from "../../templates/liquid/form.liquid";
import homeTemplate from "../../templates/liquid/home.liquid";
import layoutTemplate from "../../templates/liquid/layout.liquid";
import menuTemplate from "../../templates/liquid/menu.liquid";
import pageTemplate from "../../templates/liquid/page.liquid";

type Fetcher = { fetch(request: Request): Promise<Response> };
type R2Object = { body: ReadableStream; httpMetadata?: { contentType?: string } };
type R2Bucket = { get(key: string): Promise<R2Object | null> };
type D1Database = { prepare(query: string): { bind(...values: string[]): { run(): Promise<unknown> } } };
type Env = { ASSETS: Fetcher | R2Bucket; STATIC: Fetcher; TEMPLATES: Fetcher; DB?: D1Database };
type Submission = { formType: string; submittedAt: string; payload: Record<string, string> };

const submissions: Submission[] = [];
const menu = [
  { slug: "sausage", name: "Sausage", description: "Fresh and smoked Kielbasa, Krakowska, and a premium selection of house-made sausage built on time-honored methods.", items: [["Fresh Kielbasa", "/assets/img/feb9c6602c164b05bdd77d1ebe94979c.jpeg", "Our classic fresh Kielbasa is seasoned and prepared in-house for your next family meal."], ["Smoked sausage", "/assets/img/b40961b50a8c40448e2f4c8505227745.jpeg", "A richly flavored smoked sausage made with time-honored recipes."], ["Homemade sausage", "/assets/img/2b5781b091304453bfb026d0a3b9112d.jpeg", "A selection of handcrafted sausage made fresh for the butcher case."]] },
  { slug: "meats", name: "Meats", description: "Fresh-cut meats selected to make everyday dinners and special occasions memorable.", items: [["Fresh burger patties", "/assets/img/344b9b3c8a20412eabc0cb981c2ad59c.jpeg", "Fresh-ground burger patties ready for the grill, skillet, or your favorite recipe."], ["Fresh meat selection", "/assets/img/8e798e9ab03f44aab4466591e2e41429.jpeg", "Quality cuts and specialty meats for everyday dinners and special occasions."]] },
  { slug: "homemade-foods", name: "Homemade Foods", description: "Comforting prepared favorites made with the same care we bring to our butcher case.", items: [["Homemade salad", "/assets/img/604ced1931264f66a426544777bca76f.jpeg", "Prepared favorites made in small batches for an easy side dish."], ["Kapusta and sausage", "/assets/img/853e39c44ed3495095a780ad8737fd57.jpeg", "A Polish comfort-food favorite with savory sausage and tangy cabbage."]] },
  { slug: "polish-grocery", name: "Polish Grocery", description: "Polish pantry staples, specialty ingredients, and familiar flavors for your table.", items: [["Polish grocery and pierogi case", "/assets/img/c32f783993ad438ca0938aade9178ed2.jpeg", "A well-stocked selection of pierogi, Polish staples, and market favorites."]] },
  { slug: "gift-cards-and-gifts", name: "Gift Cards & Gifts", description: "Thoughtful gifts for the food lovers and Lewandoski's regulars in your life.", items: [["Lewandoskis Market merchandise", "/assets/img/gallery/f8b7bdf209434584b37c8fbd2f52ebcb.jpeg", "Market merchandise and gifts for loyal West Side food lovers."]] },
  { slug: "breads-and-desserts", name: "Breads & Desserts", description: "Sweet and savory bakery favorites to round out any meal.", items: [["Fresh baked bread", "/assets/img/gallery/5b1ed2d1d813474a84469fd9e5290031.jpeg", "Fresh bread and bakery favorites to complete a meal."], ["Kremowki dessert", "/assets/img/gallery/03b659a561074e7ba76ed6e7cf62a9ca.jpeg", "A classic Polish pastry with delicate layers and a rich, creamy filling."]] },
] as const;

const pages: Record<string, { title: string; heading: string; intro: string; image: string }> = {
  "/about": { title: "About", heading: "Lewandoski's Market", intro: "Polish heritage and neighborhood tradition on Grand Rapids' West Side.", image: "/assets/img/about_1_new.jpg" },
  "/community-partners": { title: "Community Partners", heading: "Proud to stand with our community.", intro: "The West Side is stronger when local people and organizations show up for one another.", image: "/assets/img/community_partners_back.jpg" },
  "/events": { title: "Events", heading: "Events are coming soon.", intro: "We are updating our events calendar. Please stay tuned.", image: "/assets/img/events_back_new.jpg" },
};

const liquid = new Liquid();
const templates: Record<string, string> = {
  "layout.liquid": layoutTemplate,
  "home.liquid": homeTemplate,
  "page.liquid": pageTemplate,
  "menu.liquid": menuTemplate,
  "form.liquid": formTemplate,
  "partials/menu-category.liquid": menuCategoryTemplate,
  "partials/form-feedback.liquid": formFeedback,
};

async function renderTemplate(_env: Env, name: string, context: Record<string, unknown>) {
  const source = templates[name];
  if (!source) throw new Error(`Missing shared template: ${name}`);
  return liquid.parseAndRender(source, context);
}

async function renderPage(env: Env, name: string, context: Record<string, unknown>) {
  const content = await renderTemplate(env, name, context);
  return renderTemplate(env, "layout.liquid", { ...context, content });
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
  if (missing.length) return new Response(await renderTemplate(env, "partials/form-feedback.liquid", { error: `Please complete: ${missing.map(field => field.replaceAll("_", " ")).join(", ")}.` }), { headers: { "content-type": "text/html" } });
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
    if (url.pathname.startsWith("/assets/")) {
      if ("fetch" in env.ASSETS) return env.ASSETS.fetch(new Request(new URL(url.pathname.slice(7), request.url), request));
      const object = await env.ASSETS.get(url.pathname.slice(1));
      if (!object) return new Response("Not found", { status: 404 });
      return new Response(object.body, { headers: { "content-type": object.httpMetadata?.contentType ?? "application/octet-stream" } });
    }
    if (url.pathname.startsWith("/static/")) return env.STATIC.fetch(new Request(new URL(url.pathname.slice(7), request.url), request));
    if (url.pathname === "/forms/contact" && request.method === "POST") return handleSubmission(request, env, "contact");
    if (url.pathname === "/forms/donation" && request.method === "POST") return handleSubmission(request, env, "donation");
    if (url.pathname === "/products-specialties-gifts") {
      const selected = menu.find(category => category.slug === url.searchParams.get("category")) ?? menu[0];
      const context = { title: "Products", menu, selected };
      const name = request.headers.get("HX-Request") === "true" ? "partials/menu-category.liquid" : "menu.liquid";
      const output = request.headers.get("HX-Request") === "true" ? await renderTemplate(env, name, context) : await renderPage(env, name, context);
      return new Response(output, { headers: { "content-type": "text/html" } });
    }
    if (url.pathname === "/contact-us" || url.pathname === "/donation-request") {
      const donation = url.pathname === "/donation-request";
      const names = donation ? ["name", "email", "phone", "organization", "event_name", "event_date", "guest_count", "items_requested"] : ["first_name", "last_name", "email", "phone", "message"];
      const context = { title: donation ? "Donation Request" : "Contact Us", heading: donation ? "Donation Request" : "Contact Us", subheading: donation ? "Request Form" : "Send us a message", image: donation ? "/assets/img/donation_request_back.jpg" : "/assets/img/about_back_2.jpg", form_type: donation ? "donation" : "contact", fields: names.map(name => ({ name, label: name.replaceAll("_", " "), type: name === "email" ? "email" : "" })) };
      return new Response(await renderPage(env, "form.liquid", context), { headers: { "content-type": "text/html" } });
    }
    if (url.pathname === "/") return new Response(await renderPage(env, "home.liquid", { title: "Home", gallery: [] }), { headers: { "content-type": "text/html" } });
    const page = pages[url.pathname];
    if (page) return new Response(await renderPage(env, "page.liquid", { title: page.title, page }), { headers: { "content-type": "text/html" } });
    return new Response("Not found", { status: 404 });
  },
};
