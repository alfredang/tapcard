import { z } from "zod";

// Shared validation schemas used by both client forms and API route handlers.

// Accept string, empty string, null (Prisma's value for unset columns), or
// undefined — so a persisted card round-trips cleanly through PATCH validation.
const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .or(z.literal(""))
  .nullish();

const optionalStr = z
  .string()
  .trim()
  .max(2000)
  .or(z.literal(""))
  .nullish();

const optionalEmail = z
  .string()
  .trim()
  .email("Enter a valid email")
  .or(z.literal(""))
  .nullish();

export const cardSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  jobTitle: optionalStr,
  company: optionalStr,
  department: optionalStr,
  bio: z.string().trim().max(600).or(z.literal("")).nullish(),
  about: z.string().trim().max(2000).or(z.literal("")).nullish(),
  tagline: optionalStr,

  mobile: optionalStr,
  officePhone: optionalStr,
  whatsapp: optionalStr,
  email: optionalEmail,
  website: optionalUrl,
  address: optionalStr,

  linkedin: optionalStr,
  facebook: optionalStr,
  instagram: optionalStr,
  tiktok: optionalStr,
  twitter: optionalStr,
  telegram: optionalStr,
  youtube: optionalStr,

  profilePhoto: optionalStr,
  companyLogo: optionalStr,
  coverBanner: optionalStr,
  introVideo: optionalStr,

  theme: z
    .enum(["CORPORATE", "MODERN", "MINIMALIST", "DARK", "CREATIVE", "LUXURY"])
    .default("MODERN"),
  accentColor: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Use a hex color")
    .or(z.literal(""))
    .nullish(),
  published: z.boolean().optional(),
});

export type CardInput = z.infer<typeof cardSchema>;

export const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: optionalEmail,
  phone: optionalStr,
  company: optionalStr,
  message: z.string().trim().max(1000).or(z.literal("")).nullish(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  company: optionalStr,
  position: optionalStr,
  email: optionalEmail,
  phone: optionalStr,
  whatsapp: optionalStr,
  address: optionalStr,
  notes: z.string().trim().max(2000).or(z.literal("")).nullish(),
  tags: optionalStr,
});

export type ContactInput = z.infer<typeof contactSchema>;

export const dealSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  value: z.coerce.number().min(0).default(0),
  stage: z
    .enum([
      "NEW_LEAD",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL",
      "NEGOTIATION",
      "WON",
      "LOST",
    ])
    .default("NEW_LEAD"),
  contactId: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type DealInput = z.infer<typeof dealSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const contactFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: optionalStr,
  email: z.string().trim().email(),
  phone: optionalStr,
  message: z.string().trim().min(1).max(2000),
});
