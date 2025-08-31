import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { pokemon } = req.body;

    if (pokemon) {
      const response = await fetch(pokemon);
      const pokemonData = await response.json();

      return res.json({
        pokemonData,
      });
    }
  } catch (e) {
    console.error("single-entry error", e);
  }
}
