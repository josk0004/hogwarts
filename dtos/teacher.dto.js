import { z } from "zod";
import {
  booleanSchema,
  dateSchema,
  DtoValidationError,
  idSchema,
  validationError,
} from "./common.js";

const teacherSchema = z.object({
  name: z.string().trim().min(1, "is required"),
  house_id: idSchema,
  employment_start: dateSchema,
  currently_active: booleanSchema,
  deceased: booleanSchema,
}).superRefine((value, context) => {
  if (value.currently_active && value.employment_start > new Date().toISOString().slice(0, 10)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["employment_start"],
      message: "cannot be in the future for an active teacher",
    });
  }
});

export class TeacherDto {
  constructor(value) {
    const parsed = teacherSchema.parse(value);
    this.name = parsed.name;
    this.houseId = parsed.house_id;
    this.employmentStart = parsed.employment_start;
    this.currentlyActive = parsed.currently_active;
    this.deceased = parsed.deceased;
  }

  static from(value) {
    try {
      return new TeacherDto(value);
    } catch (error) {
      if (error instanceof z.ZodError) throw new DtoValidationError(validationError(error));
      throw error;
    }
  }
}
