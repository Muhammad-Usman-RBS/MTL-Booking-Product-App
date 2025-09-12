import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icons from "../../../assets/icons";
import ViewDriver from "./ViewDriver";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import {
  useDeleteDriverByIdMutation,
  useGetAllDriversQuery,
  useGetDriverByIdQuery,
} from "../../../redux/api/driverApi";
import { toast } from "react-toastify";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import { useSelector } from "react-redux";
import EmptyTableMessage from "../../../constants/constantscomponents/EmptyTableMessage";

const tabOptions = ["Active", "Suspended", "Pending", "Deleted"];

const DriverList = () => {
  const user = useSelector((state) => state?.auth?.user);
  const companyId = user?.companyId;

  const [activeTab, setActiveTab] = useState("Active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [driverToDelete, setdriverToDelete] = useState(null);

  const { data: getAllDrivers } = useGetAllDriversQuery(companyId);
  const { data: getDriverById } = useGetDriverByIdQuery(selectedDriver, {
    skip: !selectedDriver,
  });
  const [deleteDriverById] = useDeleteDriverByIdMutation();

  const driversArray = getAllDrivers?.drivers || [];
  const roleFilteredDrivers =
    user?.role === "driver"
      ? driversArray.filter(
        (driver) =>
          driver?.DriverData?.employeeNumber?.toString() ===
          user?.employeeNumber?.toString()
      )
      : driversArray;

  const filteredTabData = roleFilteredDrivers.filter(
    (driver) => driver?.DriverData?.status === activeTab
  );

  const filteredData = filteredTabData.filter((driver) => {
    const query = search.toLowerCase();
    return (
      driver?.DriverData?.firstName?.toLowerCase().includes(query) ||
      driver?.DriverData?.email?.toLowerCase().includes(query) ||
      driver?.VehicleData?.make?.toLowerCase().includes(query) ||
      driver?.VehicleData?.model?.toLowerCase().includes(query)
    );
  });

  const totalPages =
    perPage === "All" ? 1 : Math.ceil(filteredData.length / perPage);

  const paginatedData =
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [filteredData, perPage, activeTab]); // eslint-disable-line

  if (selectedDriver) {
    if (!getDriverById) return <p className="p-4">Loading driver details...</p>;

    return (
      <ViewDriver
        selectedDriver={getDriverById}
        setSelectedDriver={setSelectedDriver}
      />
    );
  }

  const tableHeaders = [
    { label: "No.", key: "index" },
    { label: "Employee Number", key: "employeeNumber" },
    { label: "First Name", key: "firstName" },
    { label: "Email", key: "email" },
    { label: "Car Make", key: "carMake" },
    { label: "Car Model", key: "carModal" },
    { label: "Status", key: "status" },
    { label: "Actions", key: "actions" },
  ];

  const exportTableData = paginatedData.map((item, index) => ({
    index:
      (page - 1) * (perPage === "All" ? filteredData.length : perPage) +
      index +
      1,
    name: item.name,
    email: item.email,
    make: item.make,
    model: item.model,
    regNo: item.regNo,
    documents: item.documents,
  }));

  const tableData = !filteredData.length
    ? EmptyTableMessage({
      message: "No drivers found. Create a new driver.",
      colSpan: tableHeaders.length,
    })
    : paginatedData.map((driver, index) => ({
      index:
        (page - 1) * (perPage === "All" ? filteredData.length : perPage) +
        index +
        1,
      employeeNumber: driver?.DriverData?.employeeNumber,
      firstName: driver?.DriverData?.firstName,
      email: driver?.DriverData?.email,
      carMake: driver?.VehicleData?.carMake,
      carModal: driver?.VehicleData?.carModal,
      status: driver?.DriverData?.status,
      actions: (
        <div className="flex gap-2">
          <Icons.Eye
            className="w-8 h-8 rounded-md hover:bg-blue-600 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-[var(--light-gray)] p-2"
            onClick={() => setSelectedDriver(driver._id)}
          />
          <Link to={`/dashboard/drivers/edit/${driver._id}`}>
            <Icons.Pencil className="w-8 h-8 rounded-md hover:bg-yellow-600 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-[var(--light-gray)] p-2" />
          </Link>
          {user?.role !== "driver" && (
            <Icons.X
              onClick={() => {
                setdriverToDelete(driver);
                setShowDeleteModal(true);
              }}
              className="w-8 h-8 rounded-md hover:bg-red-800 hover:text-white text-[var(--dark-gray)] cursor-pointer border border-[var(--light-gray)] p-2"
            />
          )}
        </div>
      ),
    }));

  return (
    <>
      <div>
        <OutletHeading name="Driver List" />
        {user?.role !== "driver" && (
          <>
            <div className="flex flex-col sm:flex-row justify-between gap-4 px-4 sm:px-0 mb-4">
              <Link to="/dashboard/drivers/new" className="w-full sm:w-auto">
                <button className="btn btn-reset flex items-center gap-2 w-full sm:w-auto justify-center">
                  Create New Driver
                </button>
              </Link>
            </div>

            <div className="w-full overflow-x-auto mb-4">
              <div className="flex gap-4 text-sm font-medium border-b min-w-max sm:text-base px-2">
                {tabOptions.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 whitespace-nowrap transition-all duration-200 ${activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-[var(--dark-gray)] hover:text-blue-500"
                      }`}
                  >
                    {tab} (
                    {
                      roleFilteredDrivers.filter(
                        (d) => d?.DriverData?.status === tab
                      ).length
                    }
                    )
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <CustomTable
          tableHeaders={tableHeaders}
          tableData={tableData}
          exportTableData={exportTableData}
          showSearch={true}
          showRefresh={true}
          showDownload={true}
          showPagination={true}
          showSorting={true}
        />
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          try {
            await deleteDriverById(driverToDelete._id).unwrap();
            toast.success("Driver deleted successfully!");
            setShowDeleteModal(false);
            setdriverToDelete(null);
          } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete company.");
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setdriverToDelete(null);
        }}
      />
    </>
  );
};

export default DriverList;
