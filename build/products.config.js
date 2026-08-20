// adseyewear.com — product-page manifest.
// Rebuilds the old /product/<slug>/<id> URLs as SEO + lead-gen product pages.
// Seeded with the 4 Oakley products that historically ranked; extend this array (or
// feed a catalog export through build/products.import.js) to rebuild the full catalog.
// Content is factual for these real Oakley models; prices are intentionally omitted
// (this is a lead-gen page — the CTA is "get pricing & availability").

/** @type {Array<object>} */
const PRODUCTS = [
  {
    id: "3705",
    path: "/product/Oakley-Flak-2.0-Sunglasses-/3705",
    out: "product/Oakley-Flak-2.0-Sunglasses-/3705.html",
    brand: "Oakley",
    name: "Oakley Flak 2.0 Sunglasses",
    primaryKw: "oakley flak 2.0",
    category: "Performance Sunglasses",
    relatedGuide: "/Oakley-Sunglasses-Buyers-Guide",
    relatedRx: "/Sunglasses/2/Prescription/4/Oakley/17",
    heroImg: "aviator.jpg",
    metaTitle: "Oakley Flak 2.0 Sunglasses — Prizm & Prescription | ADS",
    metaDesc: "The Oakley Flak 2.0 — a semi-rimless performance sunglass with Prizm lenses, O Matter frame and no-slip fit. Prescription available. Get pricing & availability free.",
    overview: [
      "<p class='lead'>The <b>Oakley Flak 2.0</b> is one of Oakley's most popular performance sunglasses — a semi-rimless sport frame that pairs a lightweight, all-day-comfortable design with Oakley's contrast-enhancing Prizm lenses. It's a favorite for running, cycling, golf, baseball and everyday wear.</p>",
      "<p>Built on Oakley's <b>O Matter</b> stress-resistant frame with <b>Unobtainium</b> nose pads and temple tips that grip harder as you sweat, the Flak 2.0 stays locked in during hard efforts. The <b>Plutonite</b> lens blocks 100% of UVA/UVB/UVC and harmful blue light up to 400nm, and Prizm lens options are tuned for road, trail, golf and everyday light.</p>"
    ],
    features: [
      "Prizm™ lens options tuned by sport (Road, Trail, Golf, Field, everyday)",
      "Plutonite® lens material — 100% UV protection",
      "Lightweight, stress-resistant O Matter™ frame",
      "Unobtainium® no-slip nose pads & temples",
      "Three-Point Fit for stable, pressure-free comfort",
      "Available with Oakley Authentic Prescription Lenses",
    ],
    faq: [
      { q: "Does the Oakley Flak 2.0 come in prescription?", a: "Yes. The Flak 2.0 can be fitted with Oakley Authentic Prescription Lenses (Oakley True Digital), so you get your vision correction in Oakley's own Prizm or polarized lens options. Ask us and we'll walk you through the Rx range for your prescription." },
      { q: "What's the difference between the Flak 2.0 and Flak 2.0 XL?", a: "The Flak 2.0 XL uses a taller, larger lens for more coverage and a slightly wider fit, while the standard Flak 2.0 has a lower-profile lens. Both share the same frame technology and lens options." },
      { q: "Is the Oakley Flak 2.0 good for cycling and running?", a: "Yes — it's one of the most popular sport sunglasses for both. The no-slip Unobtainium pads, light O Matter frame and Prizm Road/Trail lenses make it a strong choice for endurance sport." },
      { q: "Which Prizm lens should I get for the Flak 2.0?", a: "Prizm Road for cycling and mixed light, Prizm Trail for off-road, Prizm Golf for the course, and Prizm Field or Prizm Black for baseball and bright conditions. Tell us your sport and we'll recommend the right tint." }
    ]
  },
  {
    id: "962",
    path: "/product/Oakley-Flak-Jacket-XLJ-Sunglasses-/962",
    out: "product/Oakley-Flak-Jacket-XLJ-Sunglasses-/962.html",
    brand: "Oakley",
    name: "Oakley Flak Jacket XLJ Sunglasses",
    primaryKw: "oakley flak jacket",
    category: "Performance Sunglasses",
    relatedGuide: "/Oakley-Sunglasses-Buyers-Guide",
    relatedRx: "/Sunglasses/2/Prescription/4/Oakley/17",
    heroImg: "sunglasses-hero.jpg",
    metaTitle: "Oakley Flak Jacket XLJ Sunglasses — Guide & Prescription | ADS",
    metaDesc: "The Oakley Flak Jacket XLJ — the classic sport sunglass with XLJ extended-lens coverage, interchangeable lenses and no-slip fit. Prescription options. Free pricing help.",
    overview: [
      "<p class='lead'>The <b>Oakley Flak Jacket</b> is the icon that started the semi-rimless sport line, and the <b>XLJ</b> version adds a taller lens for extended coverage — protecting more of your lower field of view from sun, wind and glare. It remains a go-to for cycling, running, baseball and golf.</p>",
      "<p>The Flak Jacket XLJ features interchangeable lenses so you can switch tints for changing conditions, Oakley's <b>Plutonite</b> lens for full UV protection, and the same <b>Unobtainium</b> no-slip components that keep Oakley sport frames planted during hard efforts. Many riders and runners consider it the classic that the Flak 2.0 later evolved from.</p>"
    ],
    features: [
      "XLJ extended lens for more coverage & protection",
      "Interchangeable lenses for changing light",
      "Plutonite® lens — 100% UVA/UVB/UVC protection",
      "Unobtainium® no-slip nose pads & ear socks",
      "Lightweight O Matter™ frame",
      "Prescription options via Oakley Authentic Rx",
    ],
    faq: [
      { q: "What does XLJ mean on the Oakley Flak Jacket?", a: "XLJ refers to the extended, taller lens shape — it gives more coverage across your lower field of view than the standard Flak Jacket lens, which many athletes prefer for sun and wind protection." },
      { q: "Can I get the Flak Jacket XLJ in my prescription?", a: "Yes — it can be fitted with Oakley Authentic Prescription Lenses. Share your prescription and we'll confirm the range and lens options that work with the frame." },
      { q: "Is the Flak Jacket XLJ the same as the Flak 2.0?", a: "They're closely related. The Flak Jacket XLJ is the classic model; the Flak 2.0 is the later evolution with an updated frame and lens shape. Both use interchangeable Oakley sport lenses and the same core technologies." },
      { q: "Are replacement lenses available for the Flak Jacket XLJ?", a: "Yes, the Flak Jacket XLJ uses interchangeable lenses, and a range of replacement tints is available. Ask us which lens suits your sport and light conditions." }
    ]
  },
  {
    id: "1751",
    path: "/product/Oakley-Turbine-Sunglasses-/1751",
    out: "product/Oakley-Turbine-Sunglasses-/1751.html",
    brand: "Oakley",
    name: "Oakley Turbine Sunglasses",
    primaryKw: "oakley turbine",
    category: "Lifestyle & Sport Sunglasses",
    relatedGuide: "/Oakley-Lens-Colors",
    relatedRx: "/Sunglasses/2/Prescription/4/Oakley/17",
    heroImg: "man-portrait.jpg",
    metaTitle: "Oakley Turbine Sunglasses — Prizm Lenses & Prescription | ADS",
    metaDesc: "The Oakley Turbine — a bold lifestyle-meets-sport sunglass with a durable O Matter frame and Prizm lenses. Prescription available. Get free pricing & availability.",
    overview: [
      "<p class='lead'>The <b>Oakley Turbine</b> bridges lifestyle style and sport performance — a bold, slightly larger frame with clean lines that works as well on the street as it does outdoors. It's a popular pick for people who want the everyday look with real Oakley optics.</p>",
      "<p>The Turbine uses Oakley's durable <b>O Matter</b> frame with <b>Three-Point Fit</b> for comfort and stability, metal icon accents for style, and Oakley's <b>Prizm</b> lens technology to boost contrast and clarity. Plutonite lenses deliver 100% UV protection, and prescription options are available.</p>"
    ],
    features: [
      "Bold lifestyle-meets-sport frame design",
      "Prizm™ lenses for enhanced contrast & clarity",
      "Durable, lightweight O Matter™ frame",
      "Three-Point Fit for all-day comfort",
      "Plutonite® lens — 100% UV protection",
      "Prescription options via Oakley Authentic Rx",
    ],
    faq: [
      { q: "Does the Oakley Turbine come in prescription?", a: "Yes. The Turbine can be made with Oakley Authentic Prescription Lenses in Prizm or polarized options. Send us your prescription and we'll confirm the available range." },
      { q: "Is the Oakley Turbine a sport or lifestyle sunglass?", a: "Both. Its styling leans lifestyle/everyday, but it's built on Oakley's sport-grade O Matter frame with Prizm lenses, so it performs well outdoors too." },
      { q: "What lens options does the Oakley Turbine offer?", a: "The Turbine is available in a range of Prizm and Iridium lens tints, plus polarized options. The best choice depends on your light conditions — we're happy to help you pick." },
      { q: "Does the Oakley Turbine fit larger faces?", a: "The Turbine is a slightly larger, bolder frame that suits medium-to-large faces well. Tell us your current frame size and we'll advise on fit." }
    ]
  },
  {
    id: "3703",
    path: "/product/Oakley-Prescription-Lenses/3703",
    out: "product/Oakley-Prescription-Lenses/3703.html",
    brand: "Oakley",
    name: "Oakley Prescription Lenses",
    primaryKw: "oakley prescription lenses",
    category: "Prescription Lenses",
    relatedGuide: "/Sunglasses/2/Prescription/4/Oakley/17",
    relatedRx: "/FAQ/ansi-z87-1-safety-glasses-and-rx-prescription-lenses/",
    heroImg: "guides/eyeglasses-lens.jpg",
    metaTitle: "Oakley Prescription Lenses — Authentic Rx & Prizm | ADS",
    metaDesc: "Oakley Authentic Prescription Lenses (True Digital) put your Rx into genuine Oakley Prizm, polarized and Iridium lenses for most sport frames. Free pricing & help.",
    overview: [
      "<p class='lead'><b>Oakley Prescription Lenses</b> — officially <b>Oakley Authentic Prescription Lenses</b>, made with Oakley True Digital surfacing — put your exact vision correction into genuine Oakley lens material, so you don't have to trade Oakley optics for clear sight.</p>",
      "<p>Oakley Rx lenses are cut from Oakley's own <b>Plutonite</b> material with 100% UV protection and are available in <b>Prizm</b>, polarized and Iridium options across most Oakley sport and lifestyle frames. True Digital surfacing tailors the lens to the wrap of the frame for edge-to-edge clarity even in high-curvature sport styles.</p>"
    ],
    features: [
      "Genuine Oakley Authentic Rx (True Digital surfacing)",
      "Your prescription in real Oakley Plutonite® lenses",
      "Prizm™, polarized & Iridium® options",
      "Edge-to-edge clarity tuned to high-wrap sport frames",
      "100% UVA/UVB/UVC protection",
      "Fits most Oakley sport & lifestyle frames",
    ],
    faq: [
      { q: "What are Oakley prescription lenses?", a: "They're Oakley Authentic Prescription Lenses — your vision correction made into genuine Oakley lenses using Oakley's True Digital surfacing, available in Prizm, polarized and Iridium options for most Oakley frames." },
      { q: "Can any Oakley frame take prescription lenses?", a: "Most Oakley sport and lifestyle frames accept Authentic Prescription Lenses, though very high-wrap frames and very strong prescriptions have limits. Tell us your frame and prescription and we'll confirm compatibility." },
      { q: "Can Oakley prescription lenses be Prizm or polarized?", a: "Yes. Oakley Authentic Rx is available in Prizm contrast lenses, polarized lenses and Iridium mirror coatings, so you keep Oakley's optics with your prescription." },
      { q: "How strong a prescription can Oakley Rx lenses handle?", a: "Oakley True Digital covers a wide prescription range, but very strong or complex prescriptions may have frame limits due to lens curvature. Share your Rx and we'll tell you what's possible." }
    ]
  },
];

module.exports = { PRODUCTS };
