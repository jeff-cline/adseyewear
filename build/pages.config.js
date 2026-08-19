// adseyewear.com SEO/AEO rebuild — page manifest.
// Each entry = one ranked URL we are rebuilding, at its ORIGINAL path (to recapture
// residual link equity / old backlinks). `path` is the live URL; `out` is the file on disk
// that nginx `try_files $uri $uri/ $uri.html` resolves to. `cluster` drives cross-linking,
// the Guides nav dropdown, and the homepage Featured-5.

/** @typedef {{path:string,out:string,cluster:string,key:string,nav:string}} PageDef */

/** @type {PageDef[]} */
const PAGES = [
  // ── Color Vision cluster ────────────────────────────────────────────────
  { path: "/FAQ/product/color-blind-glasses/",                 out: "FAQ/product/color-blind-glasses/index.html",                 cluster: "color-vision", key: "color-blind-glasses",            nav: "Color Blind Glasses" },
  { path: "/FAQ/product/color-blind-test/",                    out: "FAQ/product/color-blind-test/index.html",                    cluster: "color-vision", key: "color-blind-test",               nav: "Color Blind Test" },
  { path: "/FAQ/product/ray-ban-color-blind-glasses/",         out: "FAQ/product/ray-ban-color-blind-glasses/index.html",         cluster: "color-vision", key: "ray-ban-color-blind-glasses",     nav: "Ray-Ban Color Blind Glasses" },
  { path: "/FAQ/product/glasses-for-blue-green-colorblindness/", out: "FAQ/product/glasses-for-blue-green-colorblindness/index.html", cluster: "color-vision", key: "blue-green-colorblindness",     nav: "Blue-Green Colorblindness" },
  { path: "/FAQ/product/glasses-for-red-green-colorblindness/", out: "FAQ/product/glasses-for-red-green-colorblindness/index.html", cluster: "color-vision", key: "red-green-colorblindness",       nav: "Red-Green Colorblindness" },
  { path: "/FAQ/product/oakley-color-blind-glasses/",          out: "FAQ/product/oakley-color-blind-glasses/index.html",          cluster: "color-vision", key: "oakley-color-blind-glasses",      nav: "Oakley Color Blind Glasses" },
  { path: "/FAQ/product/lavender-lens-color-blind-glasses/",   out: "FAQ/product/lavender-lens-color-blind-glasses/index.html",   cluster: "color-vision", key: "lavender-lens-color-blind-glasses", nav: "Lavender Lens Glasses" },
  { path: "/FAQ/product/red-lens-color-blind-glasses/",        out: "FAQ/product/red-lens-color-blind-glasses/index.html",        cluster: "color-vision", key: "red-lens-color-blind-glasses",    nav: "Red Lens Glasses" },
  { path: "/FAQ/product/color-blind-ski-goggles-inserts/",     out: "FAQ/product/color-blind-ski-goggles-inserts/index.html",     cluster: "color-vision", key: "color-blind-ski-goggles-inserts", nav: "Color Blind Ski Goggles" },

  // ── Oakley & Lens Guides cluster ────────────────────────────────────────
  { path: "/Oakley-Sunglasses-Buyers-Guide",                  out: "Oakley-Sunglasses-Buyers-Guide.html",                        cluster: "oakley-lenses", key: "oakley-buyers-guide",           nav: "Oakley Sunglasses Buyer's Guide" },
  { path: "/Oakley-Lens-Colors",                              out: "Oakley-Lens-Colors.html",                                    cluster: "oakley-lenses", key: "oakley-lens-colors",            nav: "Oakley Lens Colors" },
  { path: "/Selecting-a-Lens-Color",                          out: "Selecting-a-Lens-Color.html",                                cluster: "oakley-lenses", key: "selecting-a-lens-color",        nav: "Selecting a Lens Color" },
  { path: "/Sunglasses/2/Prescription/4/Oakley/17",           out: "Sunglasses/2/Prescription/4/Oakley/17.html",                 cluster: "oakley-lenses", key: "oakley-prescription-sunglasses", nav: "Oakley Prescription Sunglasses" },
  { path: "/Ski-Goggles/12/Prescription-Ski-Goggles/33/Oakley-Ski-Goggles/127", out: "Ski-Goggles/12/Prescription-Ski-Goggles/33/Oakley-Ski-Goggles/127.html", cluster: "oakley-lenses", key: "oakley-ski-goggles", nav: "Oakley Prescription Ski Goggles" },

  // ── Prescription Sport cluster ──────────────────────────────────────────
  { path: "/Shop-by-Activity/5/Prescription/14/Youth-Sport/62",       out: "Shop-by-Activity/5/Prescription/14/Youth-Sport/62.html",       cluster: "rx-sport", key: "youth-sport-glasses",       nav: "Youth Sport Glasses" },
  { path: "/Shop-by-Activity/5/Prescription/14/Tactical-Shooting/65",  out: "Shop-by-Activity/5/Prescription/14/Tactical-Shooting/65.html",  cluster: "rx-sport", key: "tactical-shooting-glasses", nav: "Tactical & Shooting Glasses" },
  { path: "/Shop-by-Activity/5/Prescription/14/Motorcycle-Sunglasses/69", out: "Shop-by-Activity/5/Prescription/14/Motorcycle-Sunglasses/69.html", cluster: "rx-sport", key: "motorcycle-sunglasses",  nav: "Motorcycle Sunglasses" },
  { path: "/Shop-by-Activity/5/Prescription/14/Baseball-Softball/59",  out: "Shop-by-Activity/5/Prescription/14/Baseball-Softball/59.html",  cluster: "rx-sport", key: "baseball-softball-glasses", nav: "Baseball & Softball Glasses" },
  { path: "/Shop-by-Activity/5/Prescription/14/Cycling/66",            out: "Shop-by-Activity/5/Prescription/14/Cycling/66.html",            cluster: "rx-sport", key: "cycling-glasses",          nav: "Prescription Cycling Glasses" },
  { path: "/Sunglasses/2/Prescription/4/Panoptx-7Eye/8",              out: "Sunglasses/2/Prescription/4/Panoptx-7Eye/8.html",               cluster: "rx-sport", key: "panoptx-7eye",             nav: "Panoptx 7Eye Sunglasses" },
  { path: "/Sunglasses/2/Prescription/4/Wiley-X/21",                  out: "Sunglasses/2/Prescription/4/Wiley-X/21.html",                   cluster: "rx-sport", key: "wiley-x",                  nav: "Wiley X Prescription" },
  { path: "/Lenticular-Lenses-for-High-Prescriptions",                out: "Lenticular-Lenses-for-High-Prescriptions.html",                 cluster: "rx-sport", key: "lenticular-lenses",        nav: "Lenticular Lenses (High Rx)" },
  { path: "/Prescription-Ski-Goggle-Reviews-and-FAQ",                 out: "Prescription-Ski-Goggle-Reviews-and-FAQ.html",                  cluster: "rx-sport", key: "prescription-ski-goggles", nav: "Prescription Ski Goggle Reviews" },
  { path: "/FAQ/ansi-z87-1-safety-glasses-and-rx-prescription-lenses/", out: "FAQ/ansi-z87-1-safety-glasses-and-rx-prescription-lenses/index.html", cluster: "rx-sport", key: "ansi-z87-safety-glasses", nav: "ANSI Z87.1 Safety Glasses" },
];

const CLUSTERS = {
  "color-vision": { title: "Color Vision Guides",       blurb: "Color blind glasses, tests & lens tints — how they work and who they help." },
  "oakley-lenses": { title: "Oakley & Lens Guides",     blurb: "Oakley buyer's guides, lens colors and prescription Oakley options." },
  "rx-sport":      { title: "Prescription Sport Eyewear", blurb: "Prescription glasses & goggles built for every sport and safety standard." },
};

module.exports = { PAGES, CLUSTERS };
