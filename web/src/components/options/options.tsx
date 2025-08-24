import React, { useMemo, useState } from "react";

interface OptionsProps {
  rawOptions: Record<string, string>[];
  isLoading?: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Options: React.FC<OptionsProps> = ({
  rawOptions,
  isLoading = false,
  onChange,
}) => {
  const options = useMemo(() => {
    return (
      <>
        {rawOptions.map((pokemon) => {
          return <option>{pokemon.name}</option>;
        })}
      </>
    );
  }, [rawOptions]);

  return (
    <select className="capitalize" disabled={isLoading} onChange={onChange}>
      {options}
    </select>
  );
};

export default Options;
