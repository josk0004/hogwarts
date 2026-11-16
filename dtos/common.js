import { z } from "zod";

export const integer = z.coerce.number().int();

export const idSchema = integer.positive();

export const dateSchema = z.string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be a valid date")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "must be a valid date");

export const booleanSchema = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());

export class DtoValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DtoValidationError";
  }
}

export function validationError(error) {
  return error.issues.map((issue) => `${issue.path.join(".") || "request"} ${issue.message}`).join(", ");
}

export function tryParseDto(Dto, value) {
  try {
    return { data: Dto.from(value) };
  } catch (error) {
    if (error instanceof DtoValidationError) return { error: error.message };
    throw error;
  }
}
