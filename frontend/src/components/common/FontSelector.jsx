import React, { useState } from "react";
import SelectOption from "../../constants/constantscomponents/SelectOption";

const fonts = [
  { label: "Roboto", value: "roboto", css: "'Roboto', sans-serif" },
  { label: "Open Sans", value: "opensans", css: "'Open Sans', sans-serif" },
  { label: "Lato", value: "lato", css: "'Lato', sans-serif" },
  { label: "Poppins", value: "poppins", css: "'Poppins', sans-serif" },
];

function FontSelector() {
  const [selectedFont, setSelectedFont] = useState(fonts[0].value);

  const handleChange = (e) => {
    const font = e.target.value;
    setSelectedFont(font);
    document.documentElement.style.setProperty("--app-font", font);
  };

  return (
    <div className="w-52"> 
      <SelectOption
        options={fonts}
        value={selectedFont}
        onChange={handleChange}
        width="full"
      />
    </div>
  );
}

export default FontSelector;
