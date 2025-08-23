import { useEffect, useMemo, useState } from "react";

export default function App() {
  const [features, setFeatures] = useState<any>();
  const [loading, setLoading] = useState(false);

  const [masterList, setMasterList] = useState<Record<string, string>[]>([]);

  const [one, setOne] = useState<string>();
  const [two, setTwo] = useState<string>();

  useEffect(() => {
    const res = fetch("http://localhost:3001/pokemon-list", {
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
    const res = fetch("http://localhost:3001/single-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: `https://pokeapi.co/api/v2/pokemon/${one}`,
      }),
    }).then((data) => {
      data.json().then((j) => {
        console.log("🐱", j);
        setImg1(j.imgUrl);
      });
    });
  }, [one]);

  useEffect(() => {
    const res = fetch("http://localhost:3001/single-image", {
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
    const body = {
      prompt: `combine the two images of pixelated sprites together into a single new unique pixelated sprite. 
        the result should be a unique combination of the two different sprites.
        also consider that the images are pixelated sprites, 
        please do not smooth out the pixelated feel of the images.
        pay attention to colors, try to re-color the resulting sprite in a palette that is harmonious, 
        so in the case the two sprites have clashing palettes, just choose one`,
      image1: img1,
      image2: img2,
      size: "1024x1024",
      quality: "low",
      response: "dataUrl",
      input_fidelity: "low",
    };

    const res = await fetch("http://localhost:3001/image-combine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();

    setFeatures(json.imageUrl);
    setLoading(false);
  };

  const options = useMemo(() => {
    return (
      <>
        {masterList.map((pokemon) => {
          return <option>{pokemon.name}</option>;
        })}
      </>
    );
  }, [masterList]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">Pokemon Blender</h1>

      <div className="flex w-full gap-4 padding-2">
        <div className="flex flex-col w-full">
          <select
            className="capitalize"
            disabled={loading}
            onChange={(x) => {
              setOne(x.target.value);
            }}
          >
            {options}
          </select>
          <img className="" src={img1}></img>
        </div>

        <div className="relative w-full">
          {features ? (
            <img className="h-full w-full" src={features} alt="combined" />
          ) : (
            <div className="flex w-full h-full border-4 border-blue-50">
              default element placeholder
            </div>
          )}

          {loading ? (
            <div className="absolute inset-0 w-full flex items-center justify-center bg-black/50">
              <div className="loader"></div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col w-full">
          <select
            className="capitalize"
            disabled={loading}
            onChange={(x) => {
              setTwo(x.target.value);
            }}
          >
            {options}
          </select>
          <img className="" src={img2}></img>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <button
          type="submit"
          disabled={loading || one === "" || two === ""}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Combine!"}
        </button>
      </form>
    </div>
  );
}
