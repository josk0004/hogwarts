import { findAllGrades, findGradeByLetter } from "../repositories/grades.repository.js";

export async function getGrades(req, res) {
  try {
    res.json(await findAllGrades());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

export async function getGrade(req, res) {
  const letter = typeof req.params.letter === "string" ? req.params.letter.toUpperCase() : "";
  if (!/^[A-Z]$/.test(letter)) return res.status(400).json({ error: "Invalid grade letter" });
  try {
    const grade = await findGradeByLetter(letter);
    if (!grade) return res.status(404).json({ error: "Grade not found" });
    res.json(grade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
