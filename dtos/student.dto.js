import { z } from "zod";
import { dateSchema, DtoValidationError, idSchema, integer, validationError } from "./common.js";

const studentSchema = z.object({
  name: z.string().trim().min(1, "is required"),
  house_id: idSchema,
  birthday: dateSchema,
  school_year: integer.min(1).max(7),
});

export class StudentDto {
  constructor(value) {
    const parsed = studentSchema.parse(value);
    this.name = parsed.name;
    this.houseId = parsed.house_id;
    this.birthday = parsed.birthday;
    this.schoolYear = parsed.school_year;
  }

  static from(value) {
    try {
      return new StudentDto(value);
    } catch (error) {
      if (error instanceof z.ZodError) throw new DtoValidationError(validationError(error));
      throw error;
    }
  }
}
