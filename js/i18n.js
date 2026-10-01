const LOADERS = {
  "af-ZA": () => import("../locales/af-ZA.js"),
  "ar-EG": () => import("../locales/ar-EG.js"),
  "ar-SA": () => import("../locales/ar-SA.js"),
  "az-AZ": () => import("../locales/az-AZ.js"),
  "bg-BG": () => import("../locales/bg-BG.js"),
  "bn-BD": () => import("../locales/bn-BD.js"),
  "bs-BA": () => import("../locales/bs-BA.js"),
  "ca-ES": () => import("../locales/ca-ES.js"),
  "cs-CZ": () => import("../locales/cs-CZ.js"),
  "da-DK": () => import("../locales/da-DK.js"),
  "de-AT": () => import("../locales/de-AT.js"),
  "de-CH": () => import("../locales/de-CH.js"),
  "de-DE": () => import("../locales/de-DE.js"),
  "el-GR": () => import("../locales/el-GR.js"),
  "en-AU": () => import("../locales/en-AU.js"),
  "en-CA": () => import("../locales/en-CA.js"),
  "en-GB": () => import("../locales/en-GB.js"),
  "en-US": () => import("../locales/en-US.js"),
  "es-AR": () => import("../locales/es-AR.js"),
  "es-ES": () => import("../locales/es-ES.js"),
  "es-MX": () => import("../locales/es-MX.js"),
  "et-EE": () => import("../locales/et-EE.js"),
  "eu-ES": () => import("../locales/eu-ES.js"),
  "fa-IR": () => import("../locales/fa-IR.js"),
  "fi-FI": () => import("../locales/fi-FI.js"),
  "fil-PH": () => import("../locales/fil-PH.js"),
  "fr-BE": () => import("../locales/fr-BE.js"),
  "fr-CA": () => import("../locales/fr-CA.js"),
  "fr-CH": () => import("../locales/fr-CH.js"),
  "fr-FR": () => import("../locales/fr-FR.js"),
  "ga-IE": () => import("../locales/ga-IE.js"),
  "gl-ES": () => import("../locales/gl-ES.js"),
  "ha-NG": () => import("../locales/ha-NG.js"),
  "he-IL": () => import("../locales/he-IL.js"),
  "hi-IN": () => import("../locales/hi-IN.js"),
  "hr-HR": () => import("../locales/hr-HR.js"),
  "hu-HU": () => import("../locales/hu-HU.js"),
  "id-ID": () => import("../locales/id-ID.js"),
  "is-IS": () => import("../locales/is-IS.js"),
  "it-IT": () => import("../locales/it-IT.js"),
  "ja-JP": () => import("../locales/ja-JP.js"),
  "kk-KZ": () => import("../locales/kk-KZ.js"),
  "ko-KR": () => import("../locales/ko-KR.js"),
  "lt-LT": () => import("../locales/lt-LT.js"),
  "lv-LV": () => import("../locales/lv-LV.js"),
  "mk-MK": () => import("../locales/mk-MK.js"),
  "mr-IN": () => import("../locales/mr-IN.js"),
  "ms-MY": () => import("../locales/ms-MY.js"),
  "nb-NO": () => import("../locales/nb-NO.js"),
  "ne-NP": () => import("../locales/ne-NP.js"),
  "nl-BE": () => import("../locales/nl-BE.js"),
  "nl-NL": () => import("../locales/nl-NL.js"),
  "nn-NO": () => import("../locales/nn-NO.js"),
  "pl-PL": () => import("../locales/pl-PL.js"),
  "pt-BR": () => import("../locales/pt-BR.js"),
  "pt-PT": () => import("../locales/pt-PT.js"),
  "ro-RO": () => import("../locales/ro-RO.js"),
  "ru-RU": () => import("../locales/ru-RU.js"),
  "sk-SK": () => import("../locales/sk-SK.js"),
  "sl-SI": () => import("../locales/sl-SI.js"),
  "sq-AL": () => import("../locales/sq-AL.js"),
  "sr-Cyrl": () => import("../locales/sr-Cyrl.js"),
  "sr-Latn": () => import("../locales/sr-Latn.js"),
  "sv-SE": () => import("../locales/sv-SE.js"),
  "sw-KE": () => import("../locales/sw-KE.js"),
  "ta-IN": () => import("../locales/ta-IN.js"),
  "te-IN": () => import("../locales/te-IN.js"),
  "th-TH": () => import("../locales/th-TH.js"),
  "tr-TR": () => import("../locales/tr-TR.js"),
  "uk-UA": () => import("../locales/uk-UA.js"),
  "ur-PK": () => import("../locales/ur-PK.js"),
  "uz-Latn": () => import("../locales/uz-Latn.js"),
  "vi-VN": () => import("../locales/vi-VN.js"),
  "zh-CN": () => import("../locales/zh-CN.js"),
  "zh-HK": () => import("../locales/zh-HK.js"),
  "zh-MO": () => import("../locales/zh-MO.js"),
  "zh-TW": () => import("../locales/zh-TW.js"),
  "zu-ZA": () => import("../locales/zu-ZA.js")
};

const LANG_DEFAULT = {
  en: "en-US",
  zh: "zh-CN",
  cmn: "zh-CN",
  yue: "zh-HK",
  ja: "ja-JP",
  ko: "ko-KR",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  pt: "pt-BR",
  it: "it-IT",
  nl: "nl-NL",
  pl: "pl-PL",
  ru: "ru-RU",
  uk: "uk-UA",
  tr: "tr-TR",
  ar: "ar-SA",
  he: "he-IL",
  hi: "hi-IN",
  th: "th-TH",
  vi: "vi-VN",
  id: "id-ID",
  ms: "ms-MY",
  sv: "sv-SE",
  da: "da-DK",
  no: "nb-NO",
  nb: "nb-NO",
  nn: "nn-NO",
  fi: "fi-FI",
  cs: "cs-CZ",
  sk: "sk-SK",
  hu: "hu-HU",
  ro: "ro-RO",
  el: "el-GR",
  bg: "bg-BG",
  hr: "hr-HR",
  sr: "sr-Cyrl",
  sl: "sl-SI",
  ca: "ca-ES",
  gl: "gl-ES",
  fa: "fa-IR",
  ur: "ur-PK",
  bn: "bn-BD",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  fil: "fil-PH",
  tl: "fil-PH",
  sw: "sw-KE",
  lt: "lt-LT",
  lv: "lv-LV",
  et: "et-EE",
  af: "af-ZA",
  bs: "bs-BA",
  mk: "mk-MK",
  sq: "sq-AL",
  is: "is-IS",
  eu: "eu-ES",
  ga: "ga-IE",
  az: "az-AZ",
  uz: "uz-Latn",
  kk: "kk-KZ",
  ne: "ne-NP",
  ha: "ha-NG",
  zu: "zu-ZA"
};

const REGION_MAP = {
  "en-NZ": "en-AU",
  "en-IE": "en-GB",
  "en-ZA": "en-GB",
  "en-IN": "en-GB",
  "en-SG": "en-GB",
  "en-HK": "en-GB",
  "en-PH": "en-US",
  "en-NG": "en-GB",
  "en-KE": "en-GB",
  "es-419": "es-MX",
  "es-US": "es-MX",
  "es-CO": "es-MX",
  "es-CL": "es-MX",
  "es-PE": "es-MX",
  "es-VE": "es-MX",
  "es-EC": "es-MX",
  "es-GT": "es-MX",
  "es-CR": "es-MX",
  "es-PA": "es-MX",
  "es-DO": "es-MX",
  "es-PR": "es-MX",
  "es-BO": "es-MX",
  "es-PY": "es-MX",
  "es-HN": "es-MX",
  "es-NI": "es-MX",
  "es-SV": "es-MX",
  "es-CU": "es-MX",
  "es-UY": "es-AR",
  "de-LI": "de-DE",
  "de-LU": "de-DE",
  "fr-LU": "fr-FR",
  "pt-AO": "pt-PT",
  "pt-MZ": "pt-PT",
  "pt-CV": "pt-PT",
  "pt-GW": "pt-PT",
  "pt-ST": "pt-PT",
  "pt-TL": "pt-PT",
  "pt-MO": "pt-PT",
  "nl-SR": "nl-NL",
  "nl-AW": "nl-NL",
  "ar-AE": "ar-SA",
  "ar-QA": "ar-SA",
  "ar-KW": "ar-SA",
  "ar-BH": "ar-SA",
  "ar-OM": "ar-SA",
  "ar-JO": "ar-SA",
  "ar-LB": "ar-SA",
  "ar-SY": "ar-SA",
  "ar-IQ": "ar-SA",
  "ar-YE": "ar-SA",
  "ar-MA": "ar-SA",
  "ar-DZ": "ar-SA",
  "ar-TN": "ar-SA",
  "ar-LY": "ar-SA",
  "ar-SD": "ar-SA",
  "bn-IN": "bn-BD",
  "ta-LK": "ta-IN",
  "ta-SG": "ta-IN",
  "ms-BN": "ms-MY",
  "ms-SG": "ms-MY",
  "sr-ME": "sr-Latn",
  "sr-BA": "sr-Cyrl",
  "sr-RS": "sr-Cyrl",
  "uz-UZ": "uz-Latn",
  "uz-AF": "uz-Latn"
};

const LEGACY_LANG = { iw: "he", in: "id", ji: "yi" };

const active = { id: "en-US", pack: null };
let fallbackPack = null;

function pickLocale(id) {
  if (!id || !LOADERS[id]) return null;
  return id;
}

function splitTag(tag) {
  const raw = String(tag || "").trim().replace(/_/g, "-").split("-");
  let lang = raw.length && raw[0] ? raw[0].toLowerCase() : "";
  let script = "";
  let region = "";
  for (let i = 1; i < raw.length; i++) {
    const part = raw[i];
    if (!part) continue;
    if (part.length === 4 && /^[A-Za-z]{4}$/.test(part)) {
      script = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    } else if (/^[A-Za-z]{2}$/.test(part) || /^\d{3}$/.test(part)) {
      region = part.toUpperCase();
    }
  }
  if (LEGACY_LANG[lang]) lang = LEGACY_LANG[lang];
  return { lang, script, region };
}

function matchChinese(parts) {
  if (parts.region === "HK") return pickLocale("zh-HK");
  if (parts.region === "MO") return pickLocale("zh-MO");
  if (parts.region === "TW") return pickLocale("zh-TW");
  if (parts.region === "CN" || parts.region === "SG" || parts.region === "MY") return pickLocale("zh-CN");
  if (parts.script === "Hans") return pickLocale("zh-CN");
  if (parts.script === "Hant") return pickLocale("zh-TW");
  return pickLocale("zh-CN");
}

function matchSerbian(parts) {
  if (parts.script === "Latn") return pickLocale("sr-Latn");
  if (parts.script === "Cyrl") return pickLocale("sr-Cyrl");
  if (parts.region === "ME") return pickLocale("sr-Latn");
  return pickLocale("sr-Cyrl");
}

function matchTag(tag) {
  const parts = splitTag(tag);
  if (!parts.lang) return null;
  let exact = parts.lang;
  if (parts.script) exact += "-" + parts.script;
  if (parts.region) exact += "-" + parts.region;
  let direct = pickLocale(exact);
  if (direct) return direct;
  if (parts.region) {
    direct = pickLocale(parts.lang + "-" + parts.region);
    if (direct) return direct;
  }
  if (parts.lang === "zh" || parts.lang === "cmn") return matchChinese(parts);
  if (parts.lang === "yue") {
    if (parts.region === "MO") return pickLocale("zh-MO");
    return pickLocale("zh-HK");
  }
  if (parts.lang === "sr") return matchSerbian(parts);
  if (parts.lang === "nn") return pickLocale("nn-NO") || pickLocale("nb-NO");
  if (parts.lang === "no" || parts.lang === "nb") return pickLocale("nb-NO");
  if (parts.lang === "fil" || parts.lang === "tl") return pickLocale("fil-PH");
  if (parts.region) {
    const mapped = REGION_MAP[parts.lang + "-" + parts.region];
    if (mapped && pickLocale(mapped)) return mapped;
  }
  if (parts.script) {
    direct = pickLocale(parts.lang + "-" + parts.script);
    if (direct) return direct;
  }
  const fallback = LANG_DEFAULT[parts.lang];
  if (fallback && pickLocale(fallback)) return fallback;
  return null;
}

function browserLanguages() {
  if (typeof navigator === "undefined") return ["en-US"];
  const list = [];
  if (navigator.languages && navigator.languages.length) {
    for (let i = 0; i < navigator.languages.length; i++) list.push(navigator.languages[i]);
  } else if (navigator.language) {
    list.push(navigator.language);
  }
  if (!list.length) list.push("en-US");
  return list;
}

export function resolveLocaleId(languages) {
  const list = languages && languages.length ? languages : ["en-US"];
  for (let i = 0; i < list.length; i++) {
    const found = matchTag(list[i]);
    if (found) return found;
  }
  return "en-US";
}

export function t(key) {
  const pack = active.pack;
  if (pack && Object.prototype.hasOwnProperty.call(pack, key) && pack[key] != null && pack[key] !== "") return pack[key];
  if (fallbackPack && Object.prototype.hasOwnProperty.call(fallbackPack, key) && fallbackPack[key] != null) return fallbackPack[key];
  return "";
}

function applyFont(pack) {
  const family = pack.font || "Noto Sans";
  const stack = '"' + family + '", "Noto Sans", "PingFang SC", "PingFang TC", "PingFang HK", "Hiragino Sans", "Hiragino Sans GB", "Microsoft YaHei", "Microsoft JhengHei", "Noto Sans Arabic", "Noto Sans Hebrew", "Noto Sans Devanagari", "Noto Sans Thai", "Noto Sans Bengali", "Noto Sans Tamil", "Noto Sans Telugu", sans-serif';
  if (document.documentElement && document.documentElement.style) {
    document.documentElement.style.setProperty("--font-ui", stack);
  }
  if (!document.head || !document.getElementById || !document.createElement) return;
  const extra = document.getElementById("localeFont");
  if (family === "Noto Sans") {
    if (extra && extra.parentNode) extra.parentNode.removeChild(extra);
    return;
  }
  const href = "https://fonts.googleapis.com/css2?family=" + family.replace(/ /g, "+") + ":wght@400;700&display=swap";
  if (!extra) {
    const link = document.createElement("link");
    link.id = "localeFont";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  const node = document.getElementById("localeFont");
  if (node && node.getAttribute("href") !== href) node.setAttribute("href", href);
}

function applyMessages() {
  if (!document.querySelectorAll) return;
  const nodes = document.querySelectorAll("[data-i18n]");
  for (let i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
  const arias = document.querySelectorAll("[data-i18n-aria]");
  for (let i = 0; i < arias.length; i++) arias[i].setAttribute("aria-label", t(arias[i].getAttribute("data-i18n-aria")));
  const titles = document.querySelectorAll("[data-i18n-title]");
  for (let i = 0; i < titles.length; i++) titles[i].setAttribute("title", t(titles[i].getAttribute("data-i18n-title")));
}

function applyDocument() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const pack = active.pack;
  if (!root || !pack) return;
  root.lang = active.id;
  root.dir = pack.dir === "rtl" ? "rtl" : "ltr";
  if (root.classList) root.classList.toggle("locale-compact", !!pack.compact);
  root.setAttribute("data-locale", active.id);
  applyFont(pack);
  applyMessages();
  document.title = t("docTitle");
}

async function loadPack(id) {
  const loader = LOADERS[id];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.default || null;
  } catch (_) {
    return null;
  }
}

export async function bootI18n(languages) {
  const list = languages && languages.length ? languages : browserLanguages();
  let id = resolveLocaleId(list);
  if (!LOADERS[id]) id = "en-US";
  let pack = await loadPack(id);
  if (!pack) {
    id = "en-US";
    pack = await loadPack("en-US");
  }
  if (!pack) {
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.lang = "en-US";
      document.documentElement.dir = "ltr";
      document.documentElement.setAttribute("data-locale", "en-US");
    }
    return "en-US";
  }
  fallbackPack = id === "en-US" ? pack : await loadPack("en-US");
  if (!fallbackPack) fallbackPack = pack;
  active.id = id;
  active.pack = pack;
  applyDocument();
  return id;
}
