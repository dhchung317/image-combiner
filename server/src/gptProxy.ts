import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {
  combineImages,
  fetchImage,
  prepareImageInputs,
} from "./functions/imageCombiner.js";

dotenv.config();

const app = express();

app.use(cors()); // 👈 Add this line
app.use(express.json());

app.post("/pokemon-list", async (_req, res) => {
  try {
    const pokelist = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");

    return res.json(await pokelist.json());
  } catch (e) {
    console.error("😀", e);
  }
});

app.post("/single-image", async (req, res) => {
  try {
    const { image } = req.body || {};

    const pokemon = await fetchImage(image);
    return res.json({ imgUrl: pokemon.sprites.front_default });
  } catch (e) {
    console.error("😀", e);
  }
});

app.post("/image-combine", async (req, res) => {
  try {
    const {
      prompt,
      image1,
      image2,
      size = "256x256",
      quality = "low",
      input_fidelity = "high",
      response = "dataUrl",
    } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Server missing OPENAI_API_KEY" });
    }
    if (!prompt || !image1 || !image2) {
      return res
        .status(400)
        .json({ error: "Provide 'prompt', 'image1', and 'image2'." });
    }

    const [buf1, buf2] = await prepareImageInputs(image1, image2);

    const oi = await combineImages(buf1, buf2, prompt, {
      size,
      input_fidelity,
      quality,
    });

    const b64 = oi?.data?.[0]?.b64_json;
    if (!b64)
      return res.status(502).json({ error: "No image in OpenAI response." });

    // Choose how you want to return it:
    if (response === "binary") {
      res.setHeader("Content-Type", "image/png");
      return res.send(Buffer.from(b64, "base64"));
    }
    if (response === "json") {
      return res.json(oi); // raw OpenAI JSON
    }
    // default: data URL
    return res.json({ imageUrl: `data:image/png;base64,${b64}` });
  } catch (err: any) {
    console.error("🔥 /image-combine error:", err);

    return res
      .status(500)
      .json({ error: err?.message || "Image combine failed" });
  }
});

app.listen(3001, () => {
  console.log("GPT proxy listening on port 3001");
  console.log("🔑 Using API Key:", process.env.OPENAI_API_KEY);
});
