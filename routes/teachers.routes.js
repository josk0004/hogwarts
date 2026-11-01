import multer from "multer";
import { Router } from "express";
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teachers.controller.js";

const router = Router();
const upload = multer();

router.get("/", getTeachers);
router.get("/:id", getTeacher);
router.post("/", upload.none(), createTeacher);
router.put("/:id", upload.none(), updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;
