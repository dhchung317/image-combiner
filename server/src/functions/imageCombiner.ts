import fetch from "node-fetch";
import FormData from "form-data";

type ImageInput = Buffer | string;

export type CombineImageOptions = {
  size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "low" | "medium" | "high";
  input_fidelity?: "low" | "medium" | "high";
};

export async function combineImages(
  img1: ImageInput,
  img2: ImageInput,
  prompt: string,
  options: CombineImageOptions = {}
) {
  const {
    size = "1024x1024",
    quality = "high",
    input_fidelity = "high",
  } = options;

  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("prompt", prompt);
  form.append("size", size);
  form.append("quality", quality);
  form.append("input_fidelity", input_fidelity);

  // helper to normalize inputs
  const addImage = (img: ImageInput, fallbackName: string) => {
    if (Buffer.isBuffer(img)) {
      form.append("image[]", img, { filename: fallbackName });
    } else if (typeof img === "string") {
      // accept base64 data URL or raw base64
      const match = img.match(/^data:(.+?);base64,(.*)$/);
      let b64 = img;
      let ext = "png";
      if (match) {
        b64 = match[2];
        const mime = match[1];
        ext = mime.includes("jpeg") ? "jpg" : mime.split("/")[1];
      }
      const buf = Buffer.from(b64, "base64");
      form.append("image[]", buf, { filename: `${fallbackName}.${ext}` });
    } else {
      throw new Error("Unsupported image type");
    }
  };

  addImage(img1, "image1");
  addImage(img2, "image2");

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
  return json;
}

export async function fetchImage(src: string): Promise<any> {
  const res = await fetch(src);

  return await res.json();
}

type ImageSource = string | Buffer;
// string can be a URL or base64 data URL
// Buffer = binary image

/**
 * Normalize arbitrary inputs into Buffers for combineImages()
 */
export async function prepareImageInputs(
  src1: ImageSource,
  src2: ImageSource
): Promise<[Buffer, Buffer]> {
  async function toBuffer(src: ImageSource): Promise<Buffer> {
    if (Buffer.isBuffer(src)) {
      return src; // already binary
    }

    if (typeof src === "string") {
      // Case 1: data URL (e.g. "data:image/png;base64,...")
      const match = src.match(/^data:(.+?);base64,(.*)$/);
      if (match) {
        return Buffer.from(match[2], "base64");
      }

      // Case 2: raw base64 string
      if (/^[A-Za-z0-9+/]+={0,2}$/.test(src.trim())) {
        return Buffer.from(src, "base64");
      }

      // Case 3: assume it's a URL
      const res = await fetch(src);
      if (!res.ok) throw new Error(`Failed to fetch image from ${src}`);
      const arrayBuf = await res.arrayBuffer();
      return Buffer.from(arrayBuf);
    }

    throw new Error("Unsupported image source type");
  }

  const [buf1, buf2] = await Promise.all([toBuffer(src1), toBuffer(src2)]);
  return [buf1, buf2];
}
