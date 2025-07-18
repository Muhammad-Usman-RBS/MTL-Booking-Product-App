import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import { coverageData } from "../../../constants/dashboardTabsData/data";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import { useCreateCoverageMutation, useDeleteCoverageMutation, useGetAllCoveragesQuery, useUpdateCoverageMutation } from "../../../redux/api/coverageApi";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";

const Coverage = () => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  console.log(user);
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
  return (
    <>
      <div>
        <OutletHeading name="Coverage Settings" />
        <button onClick={handleAddNew} className="btn btn-edit mb-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {selectedItem?.category === "Zone" ? "Zone" : "Postcode"}
            </label>
            <input
              type="text"
              className="custom_input"
              value={selectedItem?.value || ""}
              onChange={(e) =>
                setSelectedItem({ ...selectedItem, value: e.target.value })
              }
            />
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
