import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { image } = req.body;

    if (image) {
      const response = await fetch(image);
      const pokemon = await response.json();

      return res.json({
        imgUrl: pokemon.sprites.other["official-artwork"].front_default,
      });
    }
  } catch (e) {
    console.error("single-image error", e);
  }
}
