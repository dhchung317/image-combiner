import { useOutletContext } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { PokeAPI } from "pokeapi-types";
import { ScrollableContainer } from "../components/scroll-screen";
import { PokedexHeader } from "../components/pokedex-header";

export default function Pokedex() {
  const { list } = useOutletContext<{
    list: any[];
  }>();

  const [isLoading, setIsLoading] = useState(false);
  const [entry, setEntry] = useState<PokeAPI.Pokemon>();
  const [pokemon, setPokemon] = useState<string>();
  const [desc, setDesc] = useState<PokeAPI.PokemonSpecies>();
  const [moves, setMoves] = useState<PokeAPI.Pokemon["moves"]>();
  const [width, setWidth] = useState<number>();

  const pageOneRef = useRef<HTMLDivElement | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPokemon(e.target.value);
  };

  useEffect(() => {
    if (list.length === 0) return;

    setPokemon(list[0].name);
  }, [list]);

  useEffect(() => {
    if (!pokemon) return;
    setIsLoading(true);
    fetch("/api/single-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pokemon: `https://pokeapi.co/api/v2/pokemon/${pokemon}`,
      }),
    }).then((data) => {
      data.json().then((j) => {
        setEntry(j.pokemonData);
        setIsLoading(false);
      });
    });
  }, [pokemon, list]);

  useEffect(() => {
    if (!entry) return;

    setIsLoading(true);
    fetch("/api/single-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pokemon: entry?.species.url,
      }),
    }).then((data) => {
      data.json().then((j) => {
        setDesc(j.pokemonData);
        setIsLoading(false);
      });
    });
  }, [entry]);

  useEffect(() => {
    const moves = entry?.moves
      .filter(
        (m) =>
          m.version_group_details[0].version_group.name === "red-blue" &&
          m.version_group_details[0].move_learn_method.name === "level-up"
      )
      .sort(
        (a, b) =>
          a.version_group_details[0].level_learned_at -
          b.version_group_details[0].level_learned_at
      );

    setMoves(moves);
  }, [entry]);

  useEffect(() => {
    if (!pageOneRef.current || isLoading) return;
    setWidth(pageOneRef.current.clientWidth);
  }, [isLoading]);

  const english = desc?.flavor_text_entries.filter(
    (e) => e.language.name === "en"
  );
  const data = english?.[0].flavor_text;

  if (
    !entry
    // || isLoading
  )
    return null;

  return (
    <div className="flex max-w-6xl pokedex-bg rounded-lg m-1">
      <div
        id="pageOne"
        ref={pageOneRef}
        className="flex flex-1 flex-col py-4 px-14 gap-4 border-r-4 border-r-red-900"
      >
        <PokedexHeader width={width} list={list} onChange={onChange} />

        <ScrollableContainer
          classNames="flex self-center max-w-md"
          isLoading={isLoading}
        >
          <div id="main-image" className="relative glass-bg -m-2">
            <div className="absolute w-full h-full glass" />
            <img
              className="max-w-75 justify-self-center"
              src={
                entry?.sprites?.other?.["official-artwork"]?.front_default ??
                undefined
              }
            />
          </div>
        </ScrollableContainer>

        <ScrollableContainer isLoading={isLoading}>
          <div className="capitalize">{entry.name}</div>
          <div className="flex gap-2">
            <p>type: </p>
            <div className="flex gap-2">
              <div>{entry.types[0].type.name}</div>
              {entry.types[1] ? (
                <>
                  <p>/</p>
                  <div>{entry.types[1].type.name}</div>
                </>
              ) : null}
            </div>
          </div>
          <div>height: {entry.height / 10}m</div>
          <div>weight: {entry.weight / 100}kg</div>
          <div>{data}</div>
        </ScrollableContainer>
      </div>

      <div id="pageTwo" className="flex flex-1 flex-col gap-8 py-4 pt-12 px-14">
        <ScrollableContainer isLoading={isLoading}>
          <h3>Base Stats</h3>
          <div>base exp: {entry?.base_experience}</div>
          {entry?.stats.map((s) => {
            return (
              <div className="flex gap-4 items-center">
                <label htmlFor={s.stat.name}>{s.stat.name}</label>
                <progress id={s.stat.name} max="255" value={s.base_stat} />
                <div>{s.base_stat}</div>
              </div>
            );
          })}
        </ScrollableContainer>

        <div>
          <h3>Learned Moves</h3>
        </div>

        <ScrollableContainer isLoading={isLoading} classNames="max-h-68">
          {moves?.map((m) => {
            return (
              <div className="flex gap-6">
                <div>level {m.version_group_details[0].level_learned_at}</div>
                <div>{m.move.name}</div>
              </div>
            );
          })}
        </ScrollableContainer>
      </div>
    </div>
  );
}
