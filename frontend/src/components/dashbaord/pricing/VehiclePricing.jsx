import React, { useState } from "react";
import Icons from "../../../assets/icons";
import IMAGES from "../../../assets/images";
import { vehicleData } from "../../../constants/dashboardTabsData/data";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomModal from "../../../constants/constantscomponents/CustomModal";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const VehiclePricing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("All");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const imageOptions = [
    IMAGES.dashboardLargeLogo,
    IMAGES.mercedesSClass,
    IMAGES.mercedesVito,
  ];

  const handleEditModal = (admin) => {
    setSelectedAccount(admin);
    setShowModal(true);
  };

  const filteredData = vehicleData.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const paginatedData =
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage);

  const tableHeaders = [
    { label: "Priority", key: "priority" },
    { label: "Vehicle Name", key: "vehicleName" },
    { label: "Passengers", key: "passengers" },
    { label: "Small Luggage", key: "smallLuggage" },
    { label: "Large Luggage", key: "largeLuggage" },
    { label: "Child Seat", key: "childSeat" },
    { label: "Price", key: "price" },
    { label: "Action", key: "actions" },
  ];

  const tableData = paginatedData.map((item) => ({
    ...item,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEditModal(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  return (
    <>
      <div>
        <OutletHeading name="Vehicle Pricing" />
        <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 sm:px-0 mb-4">
          <button
            className="btn btn-edit"
            onClick={() =>
              handleEditModal({
                name: "",
                email: "",
                type: "Admin",
                status: "Active",
                password: "",
                permissions: [],
              })
            }
          >
            Add New
          </button>
        </div>

        <CustomTable
          tableHeaders={tableHeaders}
          tableData={tableData}
          showPagination={true}
          showSorting={true}
          currentPage={page}
          setCurrentPage={setPage}
          perPage={perPage}
        />
      </div>

      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading={`Edit ${selectedAccount?.vehicleName || "Vehicle"}`}
      >
        <div className="w-96 mx-auto p-4 font-sans space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <input
              type="number"
              className="custom_input"
              value={selectedAccount?.priority || ""}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  priority: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vehicle Name
            </label>
            <input
              type="text"
              className="custom_input"
              value={selectedAccount?.vehicleName || ""}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  vehicleName: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Path or URL
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="custom_input flex-1"
                value={selectedAccount?.image || ""}
                onChange={(e) =>
                  setSelectedAccount({
                    ...selectedAccount,
                    image: e.target.value,
                  })
                }
              />
              <button
                type="button"
                className="px-3 py-1 bg-gray-200 border border-gray-400 rounded hover:bg-gray-300"
                onClick={() => setShowImageSelector(true)}
              >
                📁
              </button>
            </div>

            {selectedAccount?.image && (
              <div className="flex justify-center">
                <img
                  src={selectedAccount.image}
                  alt="Preview"
                  className="mt-4 w-32 h-20 text-center object-cover rounded shadow"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Passenger Capacity
            </label>
            <input
              type="number"
              className="custom_input"
              value={selectedAccount?.passengers || ""}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  passengers: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Small Luggage Capacity
            </label>
            <input
              type="number"
              className="custom_input"
              value={selectedAccount?.smallLuggage || ""}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  smallLuggage: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Large Luggage Capacity
            </label>
            <input
              type="number"
              className="custom_input"
              value={selectedAccount?.largeLuggage || ""}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  largeLuggage: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Child Seats Capacity
            </label>
            <input
              type="number"
              className="custom_input"
              value={selectedAccount?.childSeat || ""}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  childSeat: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price Type
            </label>
            <SelectOption width="full" options={["Percentage", "Amount"]} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount / Percentage
            </label>
            <input
              type="number"
              className="custom_input"
              value={selectedAccount?.price || ""}
              onChange={(e) =>
                setSelectedAccount({
                  ...selectedAccount,
                  price: e.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                toast.success("Vehicle Updated!");
                setShowModal(false);
              }}
              className="btn btn-reset"
            >
              Update
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="btn btn-cancel"
            >
              Cancel
            </button>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        heading="Select Image"
      >
        <div className="grid grid-cols-3 gap-4 p-4">
          {imageOptions.map((imgPath) => (
            <img
              key={imgPath}
              src={imgPath}
              alt="vehicle"
              className="cursor-pointer rounded shadow border hover:border-blue-500"
              onClick={() => {
                setSelectedAccount({ ...selectedAccount, image: imgPath });
                setShowImageSelector(false);
              }}
            />
          ))}
        </div>
      </CustomModal>
    </>
  );
};

export default VehiclePricing;
