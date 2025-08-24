import fetch from "node-fetch";
import FormData from "form-data";
import sharp from "sharp";

type ImageInput = Buffer | string;

export type CombineImageOptions = {
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "low" | "medium" | "high";
  input_fidelity?: "low" | "medium" | "high";
};

export async function combineImages(
  img1: ImageInput,
  img2: ImageInput,
  prompt: string,
  options: CombineImageOptions = {}
): Promise<{ data: any } | null> {
  const {
    size = "1024x1024",
    quality = "low",
    input_fidelity = "high",
  } = options;

  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("prompt", prompt);
  form.append("size", size);
  form.append("quality", quality);
  form.append("input_fidelity", input_fidelity);
  form.append("image[]", img1, { filename: "image1" });
  form.append("image[]", img2, { filename: "image2" });

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
    },
    body: form,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(`OpenAI error: ${JSON.stringify(json)}`);
  }

  if (typeof json === "object" && json !== null && "data" in json) {
    return json;
  }

  return null;
}

export async function fetchImage(src: string): Promise<any> {
  const res = await fetch(src);

  return await res.json();
}

/**
 * Normalize arbitrary inputs into Buffers for combineImages()
 */
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
