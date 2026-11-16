import { z } from "zod";
import { DtoValidationError, idSchema, validationError } from "./common.js";

export class IdDto {
  constructor(value) {
    const parsed = z.object({ id: idSchema }).parse(value);
    this.id = parsed.id;
  }

  static from(value) {
    try {
      return new IdDto(value);
    } catch (error) {
      if (error instanceof z.ZodError) throw new DtoValidationError(validationError(error));
      throw error;
    }
  }
}
