const { z } = require("zod");

const signupSchema = z.object({
  username: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().trim().min(1).optional(),
  wilaya: z.string().trim().optional(),
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1).optional(),
  email: z.string().trim().optional(), // Removed .email() validation - let controller handle it
  username: z.string().trim().min(1).optional(),
  password: z.string().min(1),
}).refine((data) => {
  // At least one of identifier, email, or username must be provided
  return !!(data.identifier || data.email || data.username);
}, {
  message: "Email, username, or identifier is required",
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.preprocess((val) => String(val || ""), z.string().regex(/^\d{6}$/)),
});

const resetPasswordSchema = otpSchema.extend({
  password: z.string().min(8),
});

const emailVerifyRequestSchema = z.object({
  email: z.string().email(),
});

const emailVerifyConfirmSchema = z.object({
  email: z.string().email(),
  token: z.string().min(16),
});

const emptyToUndefined = (v) => {
  const s = String(v ?? "").trim();
  return s ? s : undefined;
};

const updateProfileSchema = z.object({
  fullName: z.preprocess(emptyToUndefined, z.string().trim().min(1)).optional(),
  email: z.preprocess(emptyToUndefined, z.string().email()).optional(),
  wilaya: z.preprocess(emptyToUndefined, z.string().trim()).optional(),
  username: z.preprocess(emptyToUndefined, z.string().trim().min(1)).optional(),
  phone: z.preprocess(emptyToUndefined, z.string().trim().min(3)).optional(),
});

const listingSchema = z.object({
  title: z.string().trim().min(3),
  category: z
    .preprocess((v) => {
      const s = String(v ?? "").trim();
      return s ? s : undefined;
    }, z.string().trim().min(2))
    .optional(),
  wilaya: z.string().trim().optional(),
  commune: z.string().trim().optional(),
  details: z.string().trim().optional(),
  description: z.string().trim().optional(),
  status: z
    .preprocess((v) => {
      const s = String(v ?? "")
        .trim()
        .toLowerCase();
      return s ? s : undefined;
    }, z.enum(["draft", "published"]))
    .optional(),
  preparationDate: z.string().trim().optional(),
  vaccinated: z
    .union([z.boolean(), z.string().transform((v) => v === "true")])
    .optional(),
  pricePerKg: z
    .preprocess(
      (v) => (v === "" || v === undefined ? undefined : Number(v)),
      z.number().nonnegative()
    )
    .optional(),
  unit: z.string().trim().optional(),
  contactPhone: z.string().trim().optional(),
  contactEmail: z.string().email().optional(),
  tags: z
    .preprocess((v) => {
      if (Array.isArray(v)) return v;
      if (typeof v === "string" && v.trim()) {
        try {
          const parsed = JSON.parse(v);
          if (Array.isArray(parsed)) return parsed;
        } catch {}
        return v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    }, z.array(z.string()))
    .optional(),
  views: z.number().int().nonnegative().optional(),
  favorites: z.number().int().nonnegative().optional(),
  statusOverride: z.enum(["draft", "published"]).optional(),
});

module.exports = {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  otpSchema,
  resetPasswordSchema,
  emailVerifyRequestSchema,
  emailVerifyConfirmSchema,
  updateProfileSchema,
  listingSchema,
};
