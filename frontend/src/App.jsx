import React from "react"; // <-- Add this line
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className="flex gap-6">
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="w-20 h-20 transition-transform duration-300 hover:scale-110" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="w-20 h-20 transition-transform duration-300 hover:scale-110" alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl font-bold mt-6">Vite + React</h1>
      <div className="bg-gray-800 p-6 mt-6 rounded-lg shadow-lg text-center">
        <button 
          onClick={() => setCount((count) => count + 1)} 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-lg text-lg font-semibold">
          Count is {count}
        </button>
        <p className="mt-4 text-5xl text-gray-400">
         MTL BOOKING PRODUCT APP
        </p>
      </div>
      <p className="mt-6 text-gray-500 text-sm">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;