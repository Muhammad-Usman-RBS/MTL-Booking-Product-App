import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import IMAGES from '../../../../assets/images';

const CarCard = ({
  car,
  isSelected,
  onSelect,
  triggerReturnJourney,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const {
    _id,
    image,
    vehicleName = 'Unnamed Vehicle',
    price = null,
    passengers = 0,
    handLuggage = 0,
    checkinLuggage = 0,
    childSeat = 0,
    description = '',
    carModel = '',
    features = [],
    returnPrice,
  } = car;

  const validImage = image || IMAGES.profilecarimg;

  return (
    <div
      id={_id}
      className={`rounded-xl border transition-shadow duration-300 mb-6 overflow-hidden border-2 cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white'
        }`}
      onClick={() => onSelect(_id)}
    >
      <div className="p-4">
        <div className="flex gap-4">
          <img
            src={validImage}
            alt={vehicleName}
            className="w-28 h-28 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-2 shadow-sm object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/placeholder-car.png';
            }}
          />

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-800">{vehicleName}</h3>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails((p) => !p);
                }}
                className="text-gray-600 flex items-center cursor-pointer hover:text-gray-800"
              >
                Properties
                {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            <div className="mt-2 text-sm text-gray-600 flex gap-6 flex-wrap">
              <span>{passengers} Passengers</span>
              <span>{handLuggage} Small Luggage</span>
              <span>{childSeat} Child Seat</span>
              <span>{checkinLuggage} Large Luggage</span>
            </div>

            <div className='flex justify-end mt-4'>
              <div className='flex gap-4 items-center'>
                {price !== null && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(_id, 'oneWay');
                    }}
                    className="btn btn-primary"
                  >
                    ONE WAY: £{parseFloat(price).toFixed(2)}
                  </button>
                )}

                {returnPrice && returnPrice !== price && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(_id, 'return');
                      triggerReturnJourney?.();
                    }}
                    className="btn btn-reset"
                  >
                    RETURN: £{parseFloat(returnPrice).toFixed(2)}
                  </button>
                )}
              </div>
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
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check size={16} className="text-green-500 mt-1" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const CarCardSection = ({
  carList,
  selectedCarId,
  onSelect,
  triggerReturnJourney,
}) => (
  <div className="grid grid-cols-1">
    {carList.map((car) => (
      <CarCard
        key={car._id}
        car={car}
        isSelected={selectedCarId === car._id}
        onSelect={onSelect}
        triggerReturnJourney={triggerReturnJourney}
      />
    ))}
  </div>
);

export default CarCardSection;
