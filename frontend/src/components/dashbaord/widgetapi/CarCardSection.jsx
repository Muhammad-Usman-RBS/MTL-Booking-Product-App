import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

const CarCard = ({ car, isSelected, onSelect }) => {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (showDetails) {
      document.getElementById(car.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showDetails, car.id]);

  const {
    id,
    image,
    carClass,
    price,
    passengers,
    luggage,
    description,
    carModel,
  } = car;

  return (
    <div
      id={id}
      className={`rounded-xl border transition-all duration-300 ease-in-out shadow-sm hover:shadow-md mb-6 overflow-hidden cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
      style={{ minHeight: showDetails ? '230px' : '150px' }}
      onClick={() => onSelect(id)}
    >
      <div className="p-4">
        <div className="flex gap-4">
          <img src={image} alt={carClass} className="w-24 h-24 object-contain rounded-md" />

          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${carClass.includes('Electric') ? 'text-green-600' : ''}`}>{carClass}</h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">£{price}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails((prev) => !prev);
                  }}
                  className="hover:bg-gray-100 p-1 rounded"
                >
                  {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600 flex gap-6">
              <span>{passengers} Passengers</span>
              <span>{luggage} Luggage</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">{description} · {carModel}</div>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="px-6 pb-4 pt-4 text-sm text-gray-700 bg-gray-50 transition-all duration-300 ease-in-out">
          <ul className="space-y-2">
            {["Free Wi-Fi", "Air conditioning", "Professional driver", "Flight tracking"].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check size={16} className="text-blue-500 mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const CarCardSection = ({ carList, selectedCarId, onSelect }) => {
  return (
    <div className="grid grid-cols-1">
      {carList.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          isSelected={selectedCarId === car.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default CarCardSection;