import React from "react";

interface ScrollDownButtonProps {
  onClick: () => void;
}

const ScrollDownButton: React.FC<ScrollDownButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-16 right-4 bg-white text-black p-3 rounded-full hover:bg-white transition-all"
    >
      <i className="fa-solid fa-arrow-down-long w-4 h-4"></i>
    </button>
  );
};

export default ScrollDownButton;