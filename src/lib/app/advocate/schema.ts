import { z } from "zod";

export const AdvocateSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  city: z.string(),
  degree: z.string(),
  specialties: z.array(z.string()),
  yearsOfExperience: z.number(),
  phoneNumber: z.number(),
  createdAt: z.string(),
});

export type Advocate = z.infer<typeof AdvocateSchema>;
