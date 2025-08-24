import { useEffect, useMemo, useState } from "react";
import Submit from "./components/submit/submit";
import Options from "./components/options/options";

export default function App() {
  const [features, setFeatures] = useState<any>();
  const [loading, setLoading] = useState(false);

  const [masterList, setMasterList] = useState<Record<string, string>[]>([]);

  const [one, setOne] = useState<string>();
  const [two, setTwo] = useState<string>();

  useEffect(() => {
    fetch("/api/pokemon-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then((data) => {
      data.json().then((data) => {
        setMasterList(data.results);

        setOne(data.results[0].name);
        setTwo(data.results[0].name);
      });
    });
  }, []);

  const [img1, setImg1] = useState<string>();
  const [img2, setImg2] = useState<string>();

  useEffect(() => {
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
  }, [one]);

  useEffect(() => {
    fetch("/api/single-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: `https://pokeapi.co/api/v2/pokemon/${two}`,
      }),
    }).then((data) => {
      data.json().then((j) => setImg2(j.imgUrl));
    });
  }, [two]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/image-combine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt:
          "based on the two images of pokemon, derive a new pokemon that is visually pleasing in a pixelated style reminiscent of old game sprites",
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

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">Pokemon Blender</h1>

      <div className="flex w-full gap-4 padding-2">
        <div className="flex flex-col w-full">
          <Options
            rawOptions={masterList}
            isLoading={loading}
            onChange={(x) => {
              setOne(x.target.value);
            }}
          />
          <img className="" src={img1}></img>
        </div>

        <div className="relative w-full">
          {features ? (
            <img className="h-full w-full" src={features} alt="combined" />
          ) : null}

          {loading ? (
            <div className="absolute inset-0 w-full flex items-center justify-center bg-black/50">
              <div className="loader"></div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col w-full">
          <Options
            rawOptions={masterList}
            isLoading={loading}
            onChange={(x) => {
              setTwo(x.target.value);
            }}
          />
          <img className="" src={img2}></img>
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
