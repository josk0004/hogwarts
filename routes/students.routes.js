import multer from "multer";
import { Router } from "express";
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/students.controller.js";

const router = Router();
const upload = multer();

router.get("/", getStudents);
router.get("/:id", getStudent);
router.post("/", upload.none(), createStudent);
router.put("/:id", upload.none(), updateStudent);
router.delete("/:id", deleteStudent);

export default router;
