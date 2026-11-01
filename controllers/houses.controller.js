import { findAllHouses, findHouseById } from "../repositories/houses.repository.js";

export async function getHouses(req, res) {
  try {
    res.json(await findAllHouses());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getHouse(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid id" });

  try {
    const house = await findHouseById(id);
    if (!house) return res.status(404).json({ error: "House not found" });
    res.json(house);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
