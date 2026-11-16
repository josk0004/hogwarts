import multer from "multer";
import { Router } from "express";
import {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
} from "../controllers/exams.controller.js";

const router = Router();
const upload = multer();

router.get("/", getExams);
router.get("/:id", getExam);
router.post("/", upload.none(), createExam);
router.put("/:id", upload.none(), updateExam);
router.delete("/:id", deleteExam);

export default router;
