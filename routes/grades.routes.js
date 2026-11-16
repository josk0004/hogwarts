import { Router } from "express";
import { getGrades, getGrade } from "../controllers/grades.controller.js";

const router = Router();

router.get("/", getGrades);
router.get("/:letter", getGrade);

export default router;
