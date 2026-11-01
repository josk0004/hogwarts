import multer from "multer";
import { Router } from "express";
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  changeCourseTeacher,
  addStudentToCourse,
  removeStudentFromCourse,
  deleteCourse,
} from "../controllers/courses.controller.js";

const router = Router();
const upload = multer();

router.get("/", getCourses);
router.get("/:id", getCourse);
router.post("/", upload.none(), createCourse);
router.put("/:id", upload.none(), updateCourse);
router.put("/:id/teacher", upload.none(), changeCourseTeacher);
router.post("/:id/students", upload.none(), addStudentToCourse);
router.delete("/:id/students/:studentId", removeStudentFromCourse);
router.delete("/:id", deleteCourse);

export default router;
