import React from "react";

interface SubmitProps {
  onSubmit?: (e: React.FormEvent) => Promise<void>;
  isLoading?: boolean;
  buttonText?: string;
}

export const Submit: React.FC<SubmitProps> = ({
  onSubmit,
  isLoading = false,
  buttonText = "Submit",
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <button
        type="submit"
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {isLoading ? "Loading..." : buttonText}
      </button>
    </form>
  );
};
