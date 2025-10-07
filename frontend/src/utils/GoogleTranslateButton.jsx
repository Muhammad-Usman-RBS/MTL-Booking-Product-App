import React, { useEffect } from "react";

const GoogleTranslateButton = () => {
  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src*="translate.google.com"]'
    );
    if (existingScript) return;
    const addGoogleTranslateScript = () => {
      const script = document.createElement("script");
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: true,
          layout:
            window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
        },
        "google_translate_element"
      );
    };

    addGoogleTranslateScript();
  }, []);
  return (
    <div>
      <div id="google_translate_element" />
    </div>
  );
};

export default GoogleTranslateButton;
