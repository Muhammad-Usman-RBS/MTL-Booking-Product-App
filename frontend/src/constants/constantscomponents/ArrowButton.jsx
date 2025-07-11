import React from 'react';
import Icons from '../../assets/icons';

const ArrowButton = ({ label, onClick, mainColor = '#00ad54' }) => {
  return (
    <div className="w-full mt-4 text-right">
      <button
        onClick={onClick}
        className="arrowBtn relative w-full overflow-hidden rounded-3xl bg-white text-[#121212] shadow-[10px_10px_20px_rgba(0,0,0,0.05)] border-none cursor-pointer group"
      >
        <span
          className="absolute inset-0 transform -translate-x-full transition-transform duration-300 z-0 group-hover:translate-x-0"
          style={{ backgroundColor: mainColor }}
        ></span>

        <div className="relative flex items-center justify-between w-full font-semibold z-10">
          <div className="w-12 h-10 grid place-items-center" style={{ backgroundColor: mainColor }}>
            <Icons.ChevronsRight size={24} color="#fff" />
          </div>
          <span className="flex-1 text-center transition-colors duration-200 whitespace-nowrap overflow-hidden px-6 py-2 group-hover:text-white">
            {label}
          </span>
        </div>
      </button>
    </div>
  );
};

export default ArrowButton;
