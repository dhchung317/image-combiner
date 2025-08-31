import React, { forwardRef, useMemo } from "react";

interface OptionsProps {
  id?: string;
  rawOptions: Record<string, string>[];
  isLoading?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  classNames?: string;
  onClick?: (e: React.MouseEvent<HTMLSelectElement>) => void;
}

export const Options = forwardRef<HTMLSelectElement, OptionsProps>(
  (
    { id, rawOptions, isLoading = false, onChange, onClick, classNames },
    ref
  ) => {
    const options = useMemo(() => {
      return (
        <>
          {rawOptions.map((pokemon) => {
            return <option key={pokemon.name}>{pokemon.name}</option>;
          })}
        </>
      );
    }, [rawOptions]);

    return (
      <select
        ref={ref}
        id={id}
        className={`capitalize text-lg h-8 max-w-40 focus-visible:outline-red-400 focus-visible:outline-2 ${classNames}`}
        disabled={isLoading}
        onChange={onChange}
        onClick={onClick}
      >
        {options}
      </select>
    );
  }
);
