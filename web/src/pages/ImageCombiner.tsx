import { useEffect, useMemo, useState } from "react";
import { Options } from "../components/options";
import { Submit } from "../components/submit";
import { useOutletContext } from "react-router-dom";

export default function ImageCombiner() {
  const { list } = useOutletContext<{
    list: any[];
  }>();
  const [features, setFeatures] = useState<any>();
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState<string>();
  const [checked, setChecked] = useState<boolean>(false);

  const [one, setOne] = useState<string>();
  const [two, setTwo] = useState<string>();

  const [img1, setImg1] = useState<string>();
  const [img2, setImg2] = useState<string>();

  useEffect(() => {
    if (list.length === 0) return;
    setOne(list[0].name);
    setTwo(list[0].name);
  }, [list]);

  useEffect(() => {
    if (!one) return;
    fetch("/api/single-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: `https://pokeapi.co/api/v2/pokemon/${one}`,
      }),
    }).then((data) => {
      data.json().then((j) => {
        setImg1(j.imgUrl);
      });
    });
  }, [one, list]);

  useEffect(() => {
    if (!two) return;
    fetch("/api/single-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: `https://pokeapi.co/api/v2/pokemon/${two}`,
      }),
    }).then((data) => {
      data.json().then((j) => setImg2(j.imgUrl));
    });
  }, [two, list]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const submitPrompt = `based on the two images of pokemon, generate a new pokemon that blend characteristics from both.
      ${checked ? prompt : ""}`;

    console.log(submitPrompt);

    await fetch("/api/image-combine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: submitPrompt,
        tag1: one,
        tag2: two,
        image1: img1,
        image2: img2,
        size: "1024x1024",
        quality: "low",
        input_fidelity: "low",
        response: "dataUrl",
      }),
    })
      .then((r) => r.json())
      .then(({ imageUrl }) => setFeatures(imageUrl));

    setLoading(false);
  };

  const handlePrompt = (e: React.ChangeEvent<HTMLInputElement> | undefined) => {
    console.log(e?.target.value);
    e && setPrompt(e.target.value);
  };

  return (
    <div className="p-6 space-y-6 w-full mx-auto bg-red-300">
      <h1 className="text-2xl font-bold">Pokemon Blender</h1>

      <div className="flex w-full gap-4 padding-2 justify-between">
        <div className="flex flex-col content-center">
          <Options
            rawOptions={list}
            isLoading={loading}
            onChange={(x) => {
              setOne(x.target.value);
            }}
          />
          <img className="w-100% md:max-w-52 lg:max-w-84" src={img1}></img>
        </div>

        <div className="min-w-48 relative flex flex-1 justify-center">
          {features ? (
            <img className="w-100% min-w-48 md:max-w-64 lg:max-w-96" src={features} alt="combined" />
          ) : null}

          {loading ? (
            <div className="absolute inset-0 w-full flex items-center justify-center bg-black/50">
              <div className="loader"></div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col content-center">
          <Options
            rawOptions={list}
            isLoading={loading}
            onChange={(x) => {
              setTwo(x.target.value);
            }}
          />
          <img className="w-100% md:max-w-52 lg:max-w-84" src={img2}></img>
        </div>
      </div>

      <div>
        <div>
          <div>
            <input
              type="checkbox"
              id="prompt"
              onChange={(e) => setChecked(e.target.checked)}
            />
            <label htmlFor="prompt">Use Prompt</label>
          </div>
          {checked && (
            <input
              className="outline-2"
              placeholder="Enter an optional prompt"
              type="text"
              onChange={handlePrompt}
            />
          )}
        </div>
      </div>
      <Submit
        buttonText="Combine!"
        isLoading={loading || one === "" || two === ""}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
