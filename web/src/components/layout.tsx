import { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  const [list, setList] = useState([]);

  useEffect(() => {
    if (list.length > 0) return;
    fetch("/api/pokemon-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).then((data) => {
      if (list.length === 0) {
        data.json().then((data) => {
          setList(data.results);
        });
      }
    });
  }, [list]);

  return (
    <div className="flex flex-col w-screen h-screen bg-red-100">
      <nav>
        <Link to="/combiner">Pokemon Blender</Link> |{" "}
        <Link to="/pokedex">Pokedex</Link>
      </nav>
      <main className="flex w-full h-full align-center justify-center">
        <Outlet context={{ list }} />
      </main>
    </div>
  );
}
