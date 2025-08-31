import { Options } from "../options";

type PokedexHeaderProps = {
  width?: number;
  list: any[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const PokedexHeader: React.FC<PokedexHeaderProps> = ({
  width,
  list,
  onChange,
}: PokedexHeaderProps) => {
  return (
    <div
      className="clip-path rounded-tl-xl relative flex -mt-4 -mx-14 bg-red-800 h-38"
      style={{
        maxWidth: width,
      }}
    >
      <div
        id="select-bar"
        className="clip-path rounded-tl-xl absolute flex justify-between items-center px-6 max-w-full pokedex-bg top-0 left-0 w-full h-95/100 z-9"
      >
        <div className="sphere flex items-center justify-center max-w-25 max-h-25 bg-blue-500 hover:bg-sky-400">
          <Options
            id="pokemon-select"
            rawOptions={list}
            onChange={onChange}
            classNames="hide self-center h-30"
          />
        </div>
        <img
          id="logo"
          className="h-16 mb-10"
          src="https://archives.bulbagarden.net/media/upload/4/4b/Pok%C3%A9dex_logo.png"
        />
      </div>
    </div>
  );
};
