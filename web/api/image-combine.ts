import type { VercelRequest, VercelResponse } from "@vercel/node";
import sharp from "sharp";

export async function prepareImageInputs(
  src1: string,
  src2: string
): Promise<[Buffer, Buffer]> {
  const buffer1 = await getImageBuffer(src1);
  const buffer2 = await getImageBuffer(src2);

  const thumb1 = sharp(buffer1)
    .resize({ width: 40, height: 40, fit: "inside" })
    .toBuffer();
  const thumb2 = sharp(buffer2)
    .resize({ width: 40, height: 40, fit: "inside" })
    .toBuffer();

  const [buf1, buf2] = await Promise.all([thumb1, thumb2]);
  return [buf1, buf2];
}

async function getImageBuffer(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

type ImageSource = string | Buffer;

async function toBuffer(src: ImageSource): Promise<Buffer> {
  if (Buffer.isBuffer(src)) return src;

  if (typeof src === "string") {
    // data URL?
    const m = src.match(/^data:(.+?);base64,(.*)$/);
    if (m) return Buffer.from(m[2], "base64");

    // raw base64 (very loose check)
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(src.trim()))
      return Buffer.from(src, "base64");

    // assume URL
    const resp = await fetch(src);
    if (!resp.ok) throw new Error(`Failed to fetch image: ${src}`);
    const ab = await resp.arrayBuffer();
    return Buffer.from(ab);
  }
  throw new Error("Unsupported image source");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed" });

    const {
      prompt,
      tag1,
      tag2,
      image1,
      image2,
      size = "256x256", // small & cheap for testing
      quality = "low", // low/medium/high
      input_fidelity = "low", // low/medium/high
      response = "dataUrl", // "dataUrl" | "json" | "binary"
    } = req.body || {};

    if (!process.env.OPENAI_API_KEY)
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    if (!prompt || !image1 || !image2)
      return res
        .status(400)
        .json({ error: "Provide 'prompt', 'image1', and 'image2'." });

    const [buf1, buf2] = await prepareImageInputs(image1, image2);

    // Use Web FormData + Blob (available on Vercel’s runtime)
    const fd = new FormData();
    fd.append("model", "gpt-image-1");
    fd.append("prompt", String(prompt));
    fd.append("size", String(size)); // allowed: 256x256, 512x512, 1024x1024, 1792x1024, 1024x1792
    fd.append("quality", String(quality)); // low/medium/high
    fd.append("input_fidelity", String(input_fidelity)); // low/medium/high
    fd.append("output_format", "png");
    fd.append("background", "transparent");

    fd.append(
      "image[]",
      new Blob([buf1], { type: "image/png" }),
      `${tag1}.png`
    );
    fd.append(
      "image[]",
      new Blob([buf2], { type: "image/png" }),
      `${tag2}.png`
    );
    // Optional mask:
    // fd.append("mask", new Blob([maskBuf], { type: "image/png" }), "mask.png");

    const upstream = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: fd,
    });

    const json = await upstream.json();
    if (!upstream.ok) return res.status(upstream.status).json(json);

    const b64 = json?.data?.[0]?.b64_json;
    if (!b64)
      return res
        .status(502)
        .json({ error: "No image in OpenAI response.", details: json });

    if (response === "binary") {
      res.setHeader("Content-Type", "image/png");
      return res.send(Buffer.from(b64, "base64"));
    }
    if (response === "json") return res.json(json);

    return res.json({ imageUrl: `data:image/png;base64,${b64}` });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: e?.message || "Image combine failed" });
  }
}
