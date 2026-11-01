import { Router } from "express";
import { getHouses, getHouse } from "../controllers/houses.controller.js";

const router = Router();

router.get("/", getHouses);
router.get("/:id", getHouse);

export default router;
