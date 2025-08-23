export async function fetchPokeList() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");

  return res.json();
}
