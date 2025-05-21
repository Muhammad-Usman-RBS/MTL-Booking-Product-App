import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

// ✅ Single Car Card
const CarCard = ({ car, isSelected, onSelect }) => {
  const [showDetails, setShowDetails] = useState(false);

  const {
    _id,
    image = '',
    vehicleName = 'Unnamed Vehicle',
    price = 0,
    passengers = 0,
    smallLuggage = 0,
    largeLuggage = 0,
    childSeat = 0,
    description = '',
    carModel = '',
    features = [],
  } = car;

  return (
    <div
      id={_id}
      className={`rounded-xl border transition-shadow duration-300 mb-6 overflow-hidden cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white'
        }`}
      onClick={() => onSelect(_id)}
    >
      <div className="p-4">
        <div className="flex gap-4">
          <img
            src={image}
            alt={vehicleName}
            className="w-24 h-24 object-contain rounded-md border border-gray-200 bg-gray-50"
            onError={(e) => {
              e.target.src = '/placeholder-car.png';
            }}
          />

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-800">{vehicleName}</h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-blue-600">£{price}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails((prev) => !prev);
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>

            <div className="mt-2 text-sm text-gray-600 flex gap-6 flex-wrap">
              <span>{passengers} Passengers</span>
              <span>{smallLuggage} Small Luggage</span>
              <span>{childSeat} Child Seat</span>
              <span>{largeLuggage} Large Luggage</span>
            </div>

            {(description || carModel) && (
              <div className="text-xs text-gray-500 mt-1">
                {description && <span>{description}</span>}
                {carModel && <span> · {carModel}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDetails && features.length > 0 && (
        <div className="px-6 pb-4 pt-4 text-sm text-gray-700 bg-gray-50 border-t border-gray-200">
          <ul className="space-y-2">
            {features.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check size={16} className="text-green-500 mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ✅ Single Column Section Layout
const CarCardSection = ({ carList, selectedCarId, onSelect }) => {
  return (
    <div className="grid grid-cols-1">
      {carList.map((car) => (
        <CarCard
          key={car._id}
          car={car}
          isSelected={selectedCarId === car._id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default CarCardSection;
