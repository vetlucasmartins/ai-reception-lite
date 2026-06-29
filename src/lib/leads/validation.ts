import { z } from "zod";

const trimmedString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `Must be at least ${min} characters`)
    .max(max, `Must be at most ${max} characters`);

const optionalTrimmedString = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional()
  );

const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().email("Use a valid email address").optional()
);

export const publicLeadSchema = z
  .object({
    businessId: z.string().uuid("A valid business id is required"),
    name: trimmedString(2, 120),
    email: optionalEmail,
    phone: optionalTrimmedString(40),
    requestedService: optionalTrimmedString(160),
    message: trimmedString(5, 2000),
    source: z.literal("website").default("website")
  })
  .superRefine((value, context) => {
    if (!value.email && !value.phone) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide an email address or phone number",
        path: ["email"]
      });
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide an email address or phone number",
        path: ["phone"]
      });
    }
  });

export type PublicLeadInput = z.infer<typeof publicLeadSchema>;

export const businessSettingsSchema = z.object({
  name: trimmedString(2, 120),
  toneOfVoice: trimmedString(3, 120),
  timezone: trimmedString(2, 80),
  services: z.array(trimmedString(1, 120)).max(30),
  openingHours: z.record(z.string(), z.string().trim().max(80))
}).superRefine((value, context) => {
  if (Object.keys(value.openingHours).length > 14) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Opening hours must contain at most 14 entries",
      path: ["openingHours"]
    });
  }
});

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;

export function parseServices(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((service) => service.trim())
    .filter(Boolean)
    .slice(0, 30);
}

export function parseOpeningHours(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return {};
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((hours, line) => {
      const [day, ...rest] = line.split(":");
      const schedule = rest.join(":").trim();

      if (!day || !schedule) {
        return hours;
      }

      return {
        ...hours,
        [day.trim()]: schedule
      };
    }, {});
}
