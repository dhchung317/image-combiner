import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const pokelist = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
    return res.json(await pokelist.json());
  } catch (e) {
    console.error("single-image error", e);
  }
}
