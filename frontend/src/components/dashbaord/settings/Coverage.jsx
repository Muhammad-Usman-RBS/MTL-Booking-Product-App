import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { useCreateCoverageMutation, useDeleteCoverageMutation, useGetAllCoveragesQuery, useUpdateCoverageMutation } from "../../../redux/api/coverageApi";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { useGetAllZonesQuery } from "../../../redux/api/zoneApi";
import { useLazySearchPostcodeSuggestionsQuery } from "../../../redux/api/googleApi";
import { useLoading } from "../../common/LoadingProvider";

const Coverage = () => {
  const {showLoading, hideLoading} = useLoading()
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  
  // Fetch zones data with company filter
  const { data: zonesData, isLoading: zonesLoading, error: zonesError } = useGetAllZonesQuery(companyId);
  const zones = zonesData || []; // Direct access since API returns array directly

  const [isEditMode, setIsEditMode] = useState(false);
  const [createCoverage] = useCreateCoverageMutation();
  const {
    data: fetchedData,
    error,
    isLoading,
  } = useGetAllCoveragesQuery(companyId);
  const [updateCoverage] = useUpdateCoverageMutation();
  const [deleteCoverage] = useDeleteCoverageMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [coverageToDelete, setCoverageToDelete] = useState(null);
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // State for zone suggestions
  const [zoneSuggestions, setZoneSuggestions] = useState([]);
  // State for postcode suggestions
  const [postcodeSuggestions, setPostcodeSuggestions] = useState([]);
  
  // API hooks
  const [triggerPostcodeSuggestions] = useLazySearchPostcodeSuggestionsQuery();
  
   useEffect(()=> {
        if(isLoading || zonesLoading) {
          showLoading()
        } else {
          hideLoading()
        }
      },[isLoading, zonesLoading])
      
  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setSelectedItem({
      type: "Pickup",
      coverage: "Allow",
      category: "Postcode",
      value: "",
      companyId: companyId,
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  // Handle postcode suggestions
  const handlePostcodeSuggestions = async (value) => {
    if (!value || value.length < 1) {
      setPostcodeSuggestions([]);
      return;
    }
    try {
      const { data } = await triggerPostcodeSuggestions(value);
      if (data?.postcodes?.length > 0) {
        setPostcodeSuggestions([...new Set(data.postcodes.map(item => item.postcode))]);
      } else {
        setPostcodeSuggestions([]);
      }
    } catch (err) {
      console.error("Failed to fetch postcode suggestions", err);
      setPostcodeSuggestions([]);
    }
  };

  // Handle zone suggestions based on input
  const handleZoneSuggestions = (value) => {
    if (!value || value.length < 1) {
      setZoneSuggestions([]);
      return;
    }

    console.log('Available zones:', zones); // Debug log
    console.log('Search value:', value); // Debug log

    // Filter zones based on input value
    const filteredZones = zones.filter(zone => 
      zone.name && zone.name.toLowerCase().includes(value.toLowerCase())
    );
    
    console.log('Filtered zones:', filteredZones); // Debug log
    setZoneSuggestions(filteredZones);
  };

  // Handle zone selection from suggestions
  const handleZoneSelect = (zone) => {
    setSelectedItem({ 
      ...selectedItem, 
      value: zone.name,
      zoneCoordinates: zone.coordinates // Store coordinates for backend
    });
    setZoneSuggestions([]);
  };

  const handleUpdate = async () => {
    if (isEditMode) {
      try {
        // Call the update API
        await updateCoverage({
          id: selectedItem?._id,
          updatedData: selectedItem,
        }).unwrap();

        // Update local state
        const updatedData = data.map((entry) =>
          entry.id === selectedItem.id ? selectedItem : entry
        );
        setData(updatedData);
        toast.success("Coverage Updated!");
        setShowModal(false);
      } catch (error) {
        toast.error("Failed to update coverage.");
      }
    } else {
      try {
        const response = await createCoverage(selectedItem).unwrap();
        setData([...data, response.data]);
        toast.success("Coverage Added!");
        setShowModal(false);
      } catch (error) {
        console.log("error creating coverage", error);
        toast.error("Failed to create coverage.", error);
      }
    }
  };

  const tableHeaders = [
    { label: "Location Type", key: "type" },
    { label: "Coverage", key: "coverage" },
    { label: "Category", key: "category" },
    { label: "Value", key: "value" },
    { label: "Action", key: "actions" },
  ];

  const tableData = data.map((entry) => ({
    ...entry,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit({ ...entry, originalValue: entry.value })}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => {
            setCoverageToDelete(entry);
            setShowDeleteModal(true);
          }}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
        />
      </div>
    ),
  }));

  useEffect(() => {
    if (fetchedData?.data) {
      setData(fetchedData.data);
    }
  }, [fetchedData]);

  // Debug useEffect for zones
  useEffect(() => {
    console.log('Zones data changed:', zonesData);
    console.log('Zones array:', zones);
    console.log('Zones loading:', zonesLoading);
    console.log('Zones error:', zonesError);
  }, [zonesData, zones, zonesLoading, zonesError]);

  return (
    <>
      <div>
        <OutletHeading name="Coverage Settings" />
        <button onClick={handleAddNew} className="btn btn-edit mb-4">
          Add New
        </button>
        <CustomTable
        filename='Coverages-list'
          tableHeaders={tableHeaders}
          tableData={tableData}
          showPagination={true}
          showSorting={true}
        />
      </div>

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading={isEditMode ? `Edit ` : "Add New Coverage"}
      >
        <div className="mx-auto w-96 p-4 font-sans space-y-4">
          <div>
            <SelectOption
              label="Type"
              width="full"
              options={["Pickup", "Dropoff", "Both"]}
              value={selectedItem?.type}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, type: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coverage
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="coverage"
                  value="Allow"
                  checked={selectedItem?.coverage === "Allow"}
                  onChange={() =>
                    setSelectedItem({ ...selectedItem, coverage: "Allow" })
                  }
                />
                Allow
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="coverage"
                  value="Block"
                  checked={selectedItem?.coverage === "Block"}
                  onChange={() =>
                    setSelectedItem({ ...selectedItem, coverage: "Block" })
                  }
                />
                Block
              </label>
            </div>
          </div>
          <div>
            <SelectOption
              label="Category"
              width="full"
              options={["Postcode", "Zone"]}
              value={selectedItem?.category}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, category: e.target.value })
              }
            />
          </div>
          
          {/* Dynamic input field based on category */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              {selectedItem?.category === "Zone" ? "Zone" : "Postcode"}
            </label>
            
            {selectedItem?.category === "Zone" ? (
              // Zone input with suggestions
              <>
                <input
                  type="text"
                  className="custom_input"
                  placeholder="Enter zone name"
                  value={selectedItem?.value || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedItem({ ...selectedItem, value: val });
                    handleZoneSuggestions(val);
                  }}
                  onBlur={() => setTimeout(() => setZoneSuggestions([]), 200)}
                />
                {zoneSuggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                    {zoneSuggestions.map((zone, index) => (
                      <li 
                        key={zone._id || index}
                        onClick={() => handleZoneSelect(zone)}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                      >
                        <div className="font-medium">{zone.name}</div>
                        {zone.coordinates && (
                          <div className="text-xs text-gray-500">
                            {zone.coordinates.length} coordinates
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {zonesLoading && (
                  <div className="text-xs text-gray-500 mt-1">Loading zones...</div>
                )}
                {zonesError && (
                  <div className="text-xs text-red-500 mt-1">Error loading zones</div>
                )}
                {!zonesLoading && zones.length === 0 && (
                  <div className="text-xs text-gray-500 mt-1">No zones available</div>
                )}
              </>
            ) : (
              // Regular postcode input with suggestions
              <>
                <input
                  type="text"
                  className="custom_input"
                  placeholder="Enter postcode"
                  value={selectedItem?.value || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedItem({ ...selectedItem, value: val });
                    handlePostcodeSuggestions(val);
                  }}
                  onBlur={() => setTimeout(() => setPostcodeSuggestions([]), 200)}
                />
                {postcodeSuggestions.length > 0 && (
                  <ul className="absolute z-10 bg-white border rounded shadow max-h-40 overflow-y-auto w-full mt-1">
                    {postcodeSuggestions.map((postcode, index) => (
                      <li 
                        key={index}
                        onClick={() => {
                          setSelectedItem({ ...selectedItem, value: postcode });
                          setPostcodeSuggestions([]);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-b-0"
                      >
                        {postcode}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="btn btn-cancel"
            >
              Cancel
            </button>
            <button onClick={handleUpdate} className="btn btn-reset">
              {isEditMode ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </CustomModal>
      
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          try {
            await deleteCoverage(coverageToDelete._id).unwrap();
            setData(data.filter((entry) => entry._id !== coverageToDelete._id));
            toast.success("Coverage deleted successfully!");
          } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete coverage.");
          } finally {
            setShowDeleteModal(false);
            setCoverageToDelete(null);
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setCoverageToDelete(null);
        }}
      />
    </>
  );
};

export default Coverage;