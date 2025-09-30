import React, { useState } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { toast } from "react-toastify";
import {
  useCreateLocationMutation,
  useDeleteLocationByIdMutation,
  useGetAllLocationsQuery,
  useUpdateLocationByIdMutation,
} from "../../../redux/api/locationApi";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { useSelector } from "react-redux";

const Locations = () => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const [createLocation, { isLoading: isCreating }] =
    useCreateLocationMutation();
  const {
    data: locationsFromApi,
    error,
    isLoading,
  } = useGetAllLocationsQuery(companyId);
  const [updateLocation, { isLoading: isUpdating }] =
    useUpdateLocationByIdMutation();
  const [deleteLocation] = useDeleteLocationByIdMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditMode(true);
    setShowModal(true);
  };
  const handleAddNew = () => {
    setSelectedItem({
      category: "Airport",
      name: "",
      latLng: "",
      companyId: companyId,
    });
    setIsEditMode(false);
    setShowModal(true);
  };
  const handleUpdate = async () => {
    try {
      if (isEditMode) {
        await updateLocation({
          id: selectedItem._id,
          updatedData: selectedItem,
        }).unwrap();
        toast.success("Location updated!");
      } else {
        await createLocation(selectedItem).unwrap();
        toast.success("Location created!");
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error updating/creating location:", err);
      toast.error("Operation failed!");
    }
  };

  const tableHeaders = [
    { label: "Category", key: "category" },
    { label: "Location", key: "name" },
    { label: "Lat & Lng", key: "latLng" },
    { label: "Action", key: "actions" },
  ];
  const tableData = Array.isArray(locationsFromApi?.data)
    ? locationsFromApi.data.map((item) => ({
        ...item,
        actions: (
          <div className="flex gap-2">
            <Icons.Pencil
              title="Edit"
              onClick={() => handleEdit(item)}
              className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
            />
            <Icons.Trash
              title="Delete"
              onClick={() => {
                setLocationToDelete(item);
                setShowDeleteModal(true);
              }}
              className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-[var(--light-gray)] cursor-pointer"
            />
          </div>
        ),
      }))
    : [];

  if (isLoading) return <div>Loading locations...</div>;
  if(!companyId) return <div>No companyId found, contact Admin.</div>;
  if (error) return <div>Error loading locations!</div>;
  return (
    <>
      <div>
        <OutletHeading name="Locations" />
        <button onClick={handleAddNew} className="btn btn-back mb-4">
          Add New
        </button>
        <CustomTable
          tableHeaders={tableHeaders}
          tableData={tableData}
          showPagination={true}
          showSorting={true}
        />
      </div>

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading={isEditMode ? `Edit` : "Add New Location"}
      >
        <div className="p-3 flex justify-center">
          <div className="space-y-4 w-[480px]">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                className="custom_input"
                value={selectedItem?.category || ""}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, category: e.target.value })
                }
              >
                <option value="Airport">Airport</option>
                {/* Add more options if needed */}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Location Name
              </label>
              <input
                type="text"
                className="custom_input"
                value={selectedItem?.name || ""}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Latitude & Longitude
              </label>
              <input
                type="text"
                className="custom_input"
                value={selectedItem?.latLng || ""}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, latLng: e.target.value })
                }
              />
            </div>

            <div className="h-56">
              <iframe
                title="Google Map"
                className="w-full h-full border rounded"
                src={`https://maps.google.com/maps?q=${selectedItem?.latLng}&z=15&output=embed`}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleUpdate}
                className="btn btn-edit"
                disabled={isCreating}
              >
                {isEditMode ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </CustomModal>
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          try {
            await deleteLocation(locationToDelete._id).unwrap();
            toast.success("Location deleted successfully!");
          } catch (err) {
            console.error("Delete error", err);
            toast.error("Failed to delete location");
          } finally {
            setShowDeleteModal(false);
            setLocationToDelete(null);
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setLocationToDelete(null);
        }}
      />
    </>
  );
};

export default Locations;
