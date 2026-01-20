const { z } = require("zod");

// Site Settings Schemas

const MOVING_HEADER_FONT_WEIGHTS = [
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
];

const MOVING_HEADER_FONT_STYLES = ["normal", "italic", "oblique"];

const DEFAULT_MOVING_HEADER_FONT = {
  fontFamily: "Inter",
  fontSize: 15,
  fontWeight: "600",
  fontStyle: "normal",
  letterSpacing: 0.28,
  wordSpacing: 0.35,
};

const FONT_CONFIG_SCHEMA = z.object({
  fontFamily: z.string().min(1),
  fontSize: z.number().positive(),
  fontWeight: z.enum(MOVING_HEADER_FONT_WEIGHTS),
  fontStyle: z.enum(MOVING_HEADER_FONT_STYLES),
  letterSpacing: z.number(),
  wordSpacing: z.number(),
});

const movingHeaderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().min(1).optional(),
        product: z.enum(["Poulet", "Poussins", "Dinde", "Oeufs"]),
        wilaya: z.string().trim().min(2).max(80),
        price: z.preprocess(
          (v) => Number(v),
          z.number().nonnegative().max(9999)
        ),
        unit: z.enum(["kg", "piece", "douzaine"]),
      })
    )
    .max(200)
    .default([]),
  fontConfig: FONT_CONFIG_SCHEMA.optional(),
  prefixFr: z.string().trim().max(80).optional(),
  prefixAr: z.string().trim().max(80).optional(),
  textColor: z.string().trim().max(32).optional(),
  backgroundColor: z.string().trim().max(32).optional(),
  animationDuration: z.number().int().min(5).max(300).optional().default(22),
  heightPx: z
    .preprocess((v) => Number(v), z.number().int().min(40).max(120))
    .optional(),
  translateWilayaAr: z.boolean().optional(),
});

const DEFAULT_MOVING_HEADER = {
  prefixFr: "Prix du jour",
  prefixAr: "أسعار اليوم",
  items: [
    { product: "Poulet", wilaya: "Alger", price: 260, unit: "kg" },
    { product: "Poulet", wilaya: "Boumerdes", price: 260, unit: "kg" },
    { product: "Poulet", wilaya: "Blida", price: 265, unit: "kg" },
    { product: "Poulet", wilaya: "Tipaza", price: 250, unit: "kg" },
    { product: "Poussins", wilaya: "Alger", price: 180, unit: "kg" },
    { product: "Poussins", wilaya: "Boumerdes", price: 175, unit: "kg" },
  ],
  fontConfig: DEFAULT_MOVING_HEADER_FONT,
  textColor: "",
  backgroundColor: "",
  animationDuration: 22,
  heightPx: 60,
  translateWilayaAr: true,
};

const heroSlidesSchema = z.object({
  isVisible: z.boolean().optional().default(true),
  slides: z
    .array(
      z.object({
        id: z.string().min(1),
        url: z.string().min(1),
        durationMs: z.preprocess(
          (v) => Number(v),
          z.number().int().min(1000).max(600000)
        ),
      })
    )
    .max(50)
    .default([]),
});

const DEFAULT_HERO_SLIDES = {
  isVisible: true,
  slides: [],
};

const ctaSchema = z.object({
  isVisible: z.boolean().optional().default(true),
  imageUrl: z.string().optional().default(""),
  titleFr: z.string().optional().default(""),
  titleAr: z.string().optional().default(""),
  subtitleFr: z.string().optional().default(""),
  subtitleAr: z.string().optional().default(""),
  buttonFr: z.string().optional().default(""),
  buttonAr: z.string().optional().default(""),
  link: z.string().optional().default("/create-listing"),
});

const DEFAULT_CTA = {
  isVisible: true,
  imageUrl: "",
  titleFr: "",
  titleAr: "",
  subtitleFr: "",
  subtitleAr: "",
  buttonFr: "",
  buttonAr: "",
  link: "/create-listing",
};

const footerLinkSchema = z.object({
  labelFr: z.string().optional().default(""),
  labelAr: z.string().optional().default(""),
  href: z.string().optional().default("/"),
});

const footerColumnSchema = z.object({
  titleFr: z.string().optional().default(""),
  titleAr: z.string().optional().default(""),
  links: z.array(footerLinkSchema).max(50).optional().default([]),
});

const footerSchema = z.object({
  isVisible: z.boolean().optional().default(true),
  backgroundColor: z.string().optional().default(""),
  textColor: z.string().optional().default(""),
  aboutTitleFr: z.string().optional().default(""),
  aboutTitleAr: z.string().optional().default(""),
  aboutFr: z.string().optional().default(""),
  aboutAr: z.string().optional().default(""),
  callCenters: z.array(z.string()).max(20).optional().default([]),
  columns: z.array(footerColumnSchema).max(10).optional().default([]),
});

const DEFAULT_FOOTER = {
  isVisible: true,
  backgroundColor: "",
  textColor: "",
  aboutTitleFr: "",
  aboutTitleAr: "",
  aboutFr: "",
  aboutAr: "",
  callCenters: [process.env.CONTACT_PHONE || "+213 791 948 070"],
  columns: [
    {
      titleFr: "Navigation",
      titleAr: "روابط",
      links: [
        { labelFr: "Favoris", labelAr: "المحفوظات", href: "/saved" },
        { labelFr: "Paramètres", labelAr: "الإعدادات", href: "/settings" },
      ],
    },
  ],
};

const logoSchema = z.object({
  logoLight: z.string().optional().default(""),
  logoDark: z.string().optional().default(""),
});

const DEFAULT_LOGO = {
  logoLight: "",
  logoDark: "",
};

module.exports = {
  // Schemas
  movingHeaderSchema,
  heroSlidesSchema,
  ctaSchema,
  footerSchema,
  logoSchema,
  FONT_CONFIG_SCHEMA,

  // Defaults
  DEFAULT_MOVING_HEADER,
  DEFAULT_MOVING_HEADER_FONT,
  DEFAULT_HERO_SLIDES,
  DEFAULT_CTA,
  DEFAULT_FOOTER,
  DEFAULT_LOGO,

  // Constants
  MOVING_HEADER_FONT_WEIGHTS,
  MOVING_HEADER_FONT_STYLES,
};
