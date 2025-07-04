// hooks/usePasswordToggle.js
import { useState } from "react";

export default function usePasswordToggle() {
  const [visible, setVisible] = useState(false);
  const toggleVisibility = () => setVisible((prev) => !prev);

  return {
    type: visible ? "text" : "password",
    visible,
    toggleVisibility,
  };
}
