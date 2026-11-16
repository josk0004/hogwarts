import { z } from "zod";
import { DtoValidationError, idSchema, validationError } from "./common.js";

const examSchema = z.object({
  course_id: idSchema,
  student_id: idSchema,
  grade: z.string().trim().toUpperCase().regex(/^[A-Z]$/, "must be a single letter"),
});

export class ExamDto {
  constructor(value) {
    const parsed = examSchema.parse(value);
    this.courseId = parsed.course_id;
    this.studentId = parsed.student_id;
    this.grade = parsed.grade;
  }

  static from(value) {
    try {
      return new ExamDto(value);
    } catch (error) {
      if (error instanceof z.ZodError) throw new DtoValidationError(validationError(error));
      throw error;
    }
  }
}
