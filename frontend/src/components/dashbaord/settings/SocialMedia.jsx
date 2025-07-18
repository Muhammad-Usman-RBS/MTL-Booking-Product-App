import React, { useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";

const SocialMedia = () => {
  const [whatsapp, setWhatsapp] = useState("+447944596095");
  const [facebook, setFacebook] = useState(
    "https://www.facebook.com/MegaTransfersLimited/"
  );
  const [twitter, setTwitter] = useState(
    "https://twitter.com/MegaTransfers?s=20"
  );
  const [tripadvisor, setTripadvisor] = useState(
    "https://www.tripadvisor.co.uk/Profile/megatransfers?fid=84f368dc-4b5a-4ec"
  );

  const handleUpdate = () => {
    // Handle the update logic here
    console.log("Social media settings updated");
  };

  return (
    <div>
      <OutletHeading name="Social Media" />
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Whatsapp number
          </label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
            placeholder="+447..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Facebook
          </label>
          <input
            type="text"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
            placeholder="Facebook URL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Twitter
          </label>
          <input
            type="text"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
            placeholder="Twitter URL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            TripAdvisor
          </label>
          <input
            type="text"
            value={tripadvisor}
            onChange={(e) => setTripadvisor(e.target.value)}
            className="w-full border border-[var(--light-gray)] rounded px-3 py-2"
            placeholder="TripAdvisor URL"
          />
        </div>
      </div>

      <button onClick={handleUpdate} className="btn btn-reset">
        UPDATE
      </button>
    </div>
  );
};

export default SocialMedia;
