import React, { useState, useEffect, useRef } from "react";
import Icons from "../../assets/icons";

const fonts = [
  { label: "Roboto", value: "roboto", css: "'Roboto', sans-serif" },
  { label: "Open Sans", value: "opensans", css: "'Open Sans', sans-serif" },
  { label: "Lato", value: "lato", css: "'Lato', sans-serif" },
  { label: "Poppins", value: "poppins", css: "'Poppins', sans-serif" },
];

function FontSelector() {
  const fontRef = useRef(null);


  const [selectedFont, setSelectedFont] = useState(fonts[0].value);
  const [showList, setShowList] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fontRef.current && !fontRef.current.contains(event.target)) {
        setShowList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleChange = (font) => {
    setSelectedFont(font.value);
    document.documentElement.style.setProperty("--app-font", font.css);
    setShowList(false);
  };

  return (
    <>
    <div ref={fontRef} className="relative">

      <button
        className="py-1 px-[5px] rounded-md border border-theme bg-theme flex items-center justify-center"
        onClick={() => setShowList((prev) => !prev)}
      >
        <Icons.CaseSensitive className="text-theme" size={23} />
      </button>

      {showList && (
        <div className="absolute mt-2 bg-white border rounded-md shadow-md w-40 right-0 z-10">
          {fonts.map((font) => (
            <button
              key={font.value}
              className={`w-full text-left px-3 text-black py-2 hover:bg-gray-100 ${
                selectedFont === font.value ? "font-bold" : ""
              }`}
              onClick={() => handleChange(font)}
            >
              {font.label}
            </button>
          ))}
        </div>
      )}
</div>
    </>
  );
}

export default FontSelector;
