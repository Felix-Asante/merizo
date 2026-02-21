import { z } from "zod";
import {
  INPUT_REQUIRED_INVALID_ERROR_MESSAGE,
  INPUT_REQUIRED_INVALID_ERROR_MESSAGE_MIN_LENGTH,
  REGEX_PATTERNS,
} from "./validation-helpers";

export const loginSchema = z.object({
  email: z.email(INPUT_REQUIRED_INVALID_ERROR_MESSAGE).trim(),
  password: z
    .string(INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
    .regex(REGEX_PATTERNS.Password, INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
    .trim(),
});

export const signupSchema = z
  .object({
    name: z
      .string(INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
      .regex(REGEX_PATTERNS.Names, INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
      .trim(),
    email: z.email(INPUT_REQUIRED_INVALID_ERROR_MESSAGE).trim(),
    password: z
      .string(INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
      .regex(REGEX_PATTERNS.Password, INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
      .trim(),
    confirmPassword: z
      .string(INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
      .regex(REGEX_PATTERNS.Password, INPUT_REQUIRED_INVALID_ERROR_MESSAGE)
      .trim(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type LoginSchemaInput = z.infer<typeof loginSchema>;
export type SignupSchemaInput = z.infer<typeof signupSchema>;
