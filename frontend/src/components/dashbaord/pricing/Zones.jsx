import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal"; // import DeleteModal here
import { GoogleMap, LoadScript, DrawingManager, Polygon } from "@react-google-maps/api";
import { useGetAllZonesQuery, useCreateZoneMutation, useUpdateZoneMutation, useDeleteZoneMutation } from "../../../redux/api/zoneApi";
import { useLazySearchGooglePlacesQuery, useGetMapKeyQuery } from "../../../redux/api/googleApi";

const LIBRARIES = ["drawing", "places"];

const Zones = () => {
  const user = useSelector((state) => state.auth.user);
  const [selectedZone, setSelectedZone] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [tempPolygon, setTempPolygon] = useState(null);
  const [map, setMap] = useState(null);
  const drawingRef = useRef(null);
  const savedPolygonsRef = useRef([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [deleteId, setDeleteId] = useState(null); // state for delete modal

  const { data: zones = [], refetch } = useGetAllZonesQuery();
  const [createZone] = useCreateZoneMutation();
  const [updateZone] = useUpdateZoneMutation();
  const [deleteZone] = useDeleteZoneMutation();
  const [triggerSearchGooglePlaces] = useLazySearchGooglePlacesQuery();

  const { data: mapKeyData, isLoading: mapKeyLoading } = useGetMapKeyQuery();
  const googleMapKey = mapKeyData?.mapKey || "";

  const handlePolygonComplete = useCallback((polygon) => {
    setTempPolygon(polygon);
    drawingRef.current.setDrawingMode(null);
  }, []);

  const renderSavedZones = () => {
    if (!map || !window.google) return;
    savedPolygonsRef.current.forEach((poly) => poly.setMap(null));
    savedPolygonsRef.current = [];

    zones.forEach((zone) => {
      const polygon = new window.google.maps.Polygon({
        paths: zone.coordinates,
        map,
        fillColor: "#4285F4",
        fillOpacity: 0.3,
        strokeColor: "#4285F4",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        clickable: false,
        editable: false,
        zIndex: 1,
      });

      savedPolygonsRef.current.push(polygon);
    });
  };

  const handleAddZoneToMap = async () => {
    if (!newZoneName || !tempPolygon?.getPath) {
      toast.error("Please draw a polygon and enter a name");
      return;
    }

    const path = tempPolygon.getPath().getArray().map((latLng) => ({
      lat: latLng.lat(),
      lng: latLng.lng(),
    }));

    if (path.length < 3) {
      toast.error("Polygon must have at least 3 points");
      return;
    }

    try {
      await createZone({ name: newZoneName, coordinates: path });
      tempPolygon.setMap(null);
      setTempPolygon(null);
      setNewZoneName("");
      refetch();
      toast.success("Zone created successfully!");
    } catch {
      toast.error("Failed to create zone");
    }
  };

  const handleEdit = (zone) => {
    setSelectedZone(zone);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      await updateZone({
        id: selectedZone._id,
        name: selectedZone.name,
        coordinates: selectedZone.coordinates,
      });
      setShowModal(false);
      toast.success("Zone updated!");
      refetch();
    } catch {
      toast.error("Failed to update zone");
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      await deleteZone(deleteId);
      toast.success("Zone deleted!");
      setDeleteId(null);
      refetch();
    } catch {
      toast.error("Failed to delete zone");
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  useEffect(() => {
    renderSavedZones();
  }, [zones, map]);

  const handleSearchChange = async (value) => {
    setSearchInput(value);
    if (value.length >= 3) {
      try {
        const res = await triggerSearchGooglePlaces(value).unwrap();
        setSearchSuggestions(res?.predictions || []);
      } catch (err) {
        console.error("Autocomplete error", err);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSuggestionSelect = (sug) => {
    setSearchInput(`${sug.name} - ${sug.formatted_address}`);
    setSearchSuggestions([]);
  };

  const tableHeaders = [
    { label: "Zone Name", key: "name" },
    { label: "Action", key: "actions" },
  ];

  const tableData = zones.map((zone) => ({
    ...zone,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit(zone)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-[var(--dark-gray)] border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => handleDelete(zone._id)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  if (mapKeyLoading) return <div>Loading Map...</div>;

  return (
    <>
      <div>
        <OutletHeading name={showForm ? "Zone Editor" : "Zones"} />
        {showForm ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-gray-700 w-24">Zone Name</label>
              <input
                type="text"
                className="custom_input flex-1"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder="Enter zone name"
              />
              <button className="btn btn-edit" onClick={handleAddZoneToMap}>Save</button>
              <button className="btn btn-primary" onClick={() => setShowForm(false)}>Zone List</button>
            </div>

            <div className="h-[500px] mb-4">
              <LoadScript googleMapsApiKey={googleMapKey} libraries={LIBRARIES}>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={{ lat: 51.5074, lng: -0.1278 }}
                  zoom={11}
                  onLoad={(mapInstance) => setMap(mapInstance)}
                >
                  <div className="absolute top-2 right-14 z-10 w-72">
                    <input
                      type="text"
                      placeholder="Search location"
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="bg-white px-4 py-2 rounded-md border border-gray-300 shadow w-full"
                    />
                    {searchSuggestions.length > 0 && (
                      <ul className="bg-white border rounded shadow mt-1 max-h-60 overflow-y-auto">
                        {searchSuggestions.map((sug, idx) => (
                          <li
                            key={idx}
                            onClick={() => handleSuggestionSelect(sug)}
                            className="p-2 text-sm hover:bg-gray-100 cursor-pointer"
                          >
                            <strong>{sug.name}</strong> — {sug.formatted_address}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <DrawingManager
                    onLoad={(drawingManager) => (drawingRef.current = drawingManager)}
                    onPolygonComplete={handlePolygonComplete}
                    options={{
                      drawingControl: true,
                      drawingControlOptions: {
                        position: window.google?.maps?.ControlPosition?.TOP_CENTER || 1,
                        drawingModes: ["polygon"],
                      },
                      polygonOptions: {
                        fillColor: "#ff0000",
                        fillOpacity: 0.2,
                        strokeWeight: 2,
                        clickable: false,
                        editable: false,
                        zIndex: 2,
                      },
                    }}
                  />
                </GoogleMap>
              </LoadScript>
            </div>
          </>
        ) : (
          <>
            <button className="btn btn-edit mb-4" onClick={() => setShowForm(true)}>Add New</button>
            <CustomTable tableHeaders={tableHeaders} tableData={tableData} showPagination={true} showSorting={true} />
          </>
        )}
      </div>

      <CustomModal isOpen={showModal} onClose={() => setShowModal(false)} heading={`Zone Editor`}>
        <div className="space-y-4 px-4 w-full">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 w-24">Zone Name</label>
            <input
              type="text"
              className="custom_input flex-1"
              value={selectedZone?.name || ""}
              onChange={(e) => setSelectedZone({ ...selectedZone, name: e.target.value })}
            />
          </div>

          <div className="h-[450px] w-full relative">
            <LoadScript googleMapsApiKey={googleMapKey} libraries={LIBRARIES}>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={selectedZone?.coordinates?.[0] || { lat: 51.5074, lng: -0.1278 }}
                zoom={13}
                onLoad={(mapInstance) => setMap(mapInstance)}
              >
                {selectedZone?.coordinates && (
                  <Polygon
                    paths={selectedZone.coordinates}
                    options={{
                      fillColor: "#00f",
                      fillOpacity: 0.2,
                      strokeWeight: 2,
                      editable: true,
                      zIndex: 2,
                    }}
                    onLoad={(polygonInstance) => {
                      const path = polygonInstance.getPath();
                      const updateCoords = () => {
                        const newCoords = path.getArray().map((latLng) => ({
                          lat: latLng.lat(),
                          lng: latLng.lng(),
                        }));
                        setSelectedZone((prev) => ({ ...prev, coordinates: newCoords }));
                      };
                      window.google.maps.event.addListener(path, "set_at", updateCoords);
                      window.google.maps.event.addListener(path, "insert_at", updateCoords);
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </div>

          <div className="text-right pt-2">
            <button className="btn btn-edit" onClick={handleUpdate}>Update</button>
          </div>
        </div>
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <DeleteModal isOpen={!!deleteId} onConfirm={confirmDelete} onCancel={cancelDelete} />
    </>
  );
};

export default Zones;
