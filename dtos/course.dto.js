import { z } from "zod";
import { DtoValidationError, idSchema, integer, validationError } from "./common.js";

const courseFields = {
  name: z.string().trim().min(1, "is required"),
  teacher_id: idSchema,
  type: z.enum(["core", "elective", "extra-curricular"]),
  level: z.enum(["OWL", "NEWT"]),
  school_year: integer.min(1).max(7),
};

function validateCourseLevel(value, context) {
  if ((value.level === "OWL" && value.school_year > 5)
    || (value.level === "NEWT" && value.school_year < 6)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["school_year"],
      message: "does not match level",
    });
  }
}

const courseSchema = z.object(courseFields).superRefine(validateCourseLevel);

export class CourseDto {
  static schema = courseSchema;

  constructor(value) {
    const parsed = courseSchema.parse(value);
    this.name = parsed.name;
    this.teacherId = parsed.teacher_id;
    this.type = parsed.type;
    this.level = parsed.level;
    this.schoolYear = parsed.school_year;
  }

  static from(value) {
    try {
      return new CourseDto(value);
    } catch (error) {
      if (error instanceof z.ZodError) throw new DtoValidationError(validationError(error));
      throw error;
    }
  }
}

export const courseDetailsSchema = z.object({
  name: courseFields.name,
  type: courseFields.type,
  level: courseFields.level,
  school_year: courseFields.school_year,
}).superRefine(validateCourseLevel);

export class CourseDetailsDto {
  constructor(value) {
    const parsed = courseDetailsSchema.parse(value);
    this.name = parsed.name;
    this.type = parsed.type;
    this.level = parsed.level;
    this.schoolYear = parsed.school_year;
  }

  static from(value) {
    try {
      return new CourseDetailsDto(value);
    } catch (error) {
      if (error instanceof z.ZodError) throw new DtoValidationError(validationError(error));
      throw error;
    }
  }
}

export class TeacherIdDto {
  constructor(value) {
    const parsed = z.object({ teacher_id: idSchema }).parse(value);
    this.teacherId = parsed.teacher_id;
  }

  static from(value) {
    try {
      return new TeacherIdDto(value);
    } catch (error) {
      if (error instanceof z.ZodError) throw new DtoValidationError(validationError(error));
      throw error;
    }
  }
}

export class StudentIdDto {
  constructor(value) {
    const parsed = z.object({ student_id: idSchema }).parse(value);
    this.studentId = parsed.student_id;
  }

  static from(value) {
    try {
      return new StudentIdDto(value);
    } catch (error) {
      if (error instanceof z.ZodError) throw new DtoValidationError(validationError(error));
      throw error;
    }
  }
}
