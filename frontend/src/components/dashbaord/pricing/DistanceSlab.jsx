import React, { useState, useEffect } from "react";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { useGetAllVehiclesQuery, useUpdateVehicleMutation } from "../../../redux/api/vehicleApi";

const DistanceSlab = () => {
  const companyId = useSelector((state) => state.auth?.user?.companyId);
  const { data: vehicleList = [] } = useGetAllVehiclesQuery(companyId, {
    skip: !companyId,
  });

  const [data, setData] = useState([]);
  const [updateVehicle] = useUpdateVehicleMutation();

  useEffect(() => {
    if (vehicleList.length) {
      const allSlabs = [];

      vehicleList.forEach((v) => {
        v.slabs.forEach((slab) => {
          const existing = allSlabs.find(
            (s) => s.from === slab.from && s.to === slab.to
          );

          const distance = slab.to - slab.from;
          const pricePerMile = distance
            ? slab.price / distance / (1 + (v.percentageIncrease || 0) / 100)
            : 0;

          if (existing) {
            existing[v.vehicleName] = slab.price;
            existing[`${v.vehicleName}_pricePerMile`] = parseFloat(pricePerMile.toFixed(2));
          } else {
            allSlabs.push({
              from: slab.from,
              to: slab.to,
              pricePerMile: parseFloat(pricePerMile.toFixed(2)),
              [v.vehicleName]: slab.price,
              [`${v.vehicleName}_pricePerMile`]: parseFloat(pricePerMile.toFixed(2)),
            });
          }
        });
      });

      setData(allSlabs);
    }
  }, [vehicleList]);

  const handleAddSlab = () => {
    const newSlab = {
      from: 0,
      to: 0,
      pricePerMile: 0,
    };
    vehicleList.forEach((v) => {
      newSlab[v.vehicleName] = 0;
      newSlab[`${v.vehicleName}_pricePerMile`] = 0;
    });
    setData([...data, newSlab]);
  };

  const updateRow = (index, key, value) => {
    const updated = [...data];
    updated[index][key] = value;

    const from = key === "from" ? parseFloat(value) : parseFloat(updated[index].from || 0);
    const to = key === "to" ? parseFloat(value) : parseFloat(updated[index].to || 0);
    const pricePerMile = key === "pricePerMile" ? parseFloat(value) : parseFloat(updated[index].pricePerMile || 0);
    const distance = to - from;

    if (distance > 0 && pricePerMile >= 0) {
      vehicleList.forEach((v) => {
        const percent = v.percentageIncrease || 0;
        const perMile = pricePerMile * (1 + percent / 100);
        const total = perMile * distance;

        updated[index][v.vehicleName] = parseFloat(total.toFixed(2));
        updated[index][`${v.vehicleName}_pricePerMile`] = parseFloat(perMile.toFixed(2));
      });
    }

    if (key === "to" && index < updated.length - 1) {
      updated[index + 1].from = parseFloat(value);
    }

    setData(updated);
  };

  const handleDelete = (index) => {
    const updated = [...data];
    updated.splice(index, 1);
    setData(updated);
    toast.success("Slab Deleted!");
  };

  const handleSaveAll = async () => {
    try {
      await Promise.all(
        vehicleList.map(async (v) => {
          const vehicleSlabs = data.map((slab) => {
            const distance = slab.to - slab.from;
            const perMile = slab[`${v.vehicleName}_pricePerMile`] || 0;
            const totalPrice = distance > 0 ? perMile * distance : 0;

            return {
              from: slab.from,
              to: slab.to,
              price: parseFloat(totalPrice.toFixed(2)),
              pricePerMile: parseFloat(perMile.toFixed(2)),
            };
          });

          await updateVehicle({
            id: v._id,
            formData: {
              slabs: vehicleSlabs,
              companyId,
              priority: v.priority,
              vehicleName: v.vehicleName,
              passengers: v.passengers,
              handLuggage: v.handLuggage,
              checkinLuggage: v.checkinLuggage,
              childSeat: v.childSeat,
              percentageIncrease: v.percentageIncrease,
              priceType: v.priceType,
              image: v.image,
              features: v.features,
            },
          });
        })
      );
      toast.success("All Slabs Updated Successfully!");
    } catch (err) {
      toast.error("Error updating slabs");
      console.error(err);
    }
  };

  const tableHeaders = [
    { label: "Distance (miles)", key: "distance" },
    { label: "Price Per Mile", key: "pricePerMile" },
    ...vehicleList.map((v) => ({
      label: `${v.vehicleName} (${v.percentageIncrease}%)`,
      key: `${v.vehicleName}_total`,
    })),
    { label: "Action", key: "actions" },
  ];

  const tableData = data.map((item, idx) => {
    const slabDistance = (item.to || 0) - (item.from || 0);

    const row = {
      distance: (
        <div className="flex items-center gap-4">
          <label className="font-bold text-xs">From:</label>
          <div className="w-20">
            <input
              type="number"
              className="custom_input"
              value={item.from}
              onChange={(e) =>
                updateRow(idx, "from", parseFloat(e.target.value))
              }
            />
          </div>
          <span className="text-gray-500 font-bold px-1">-</span>
          <label className="font-bold text-xs">To:</label>
          <div className="w-20">
            <input
              type="number"
              className="custom_input"
              value={item.to}
              onChange={(e) =>
                updateRow(idx, "to", parseFloat(e.target.value))
              }
            />
          </div>
        </div>
      ),
      pricePerMile: (
        <div className="w-24">
          <input
            type="number"
            className="custom_input"
            value={item.pricePerMile}
            onChange={(e) =>
              updateRow(idx, "pricePerMile", parseFloat(e.target.value))
            }
          />
        </div>
      ),
      actions: (
        <div className="flex gap-2">
          <Icons.Trash
            title="Delete"
            onClick={() => handleDelete(idx)}
            className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-[var(--dark-gray)] border border-gray-300 cursor-pointer"
          />
        </div>
      ),
    };

    vehicleList.forEach((v) => {
      const percent = v.percentageIncrease || 0;
      const perMile = item.pricePerMile * (1 + percent / 100);
      const total = perMile * slabDistance;

      item[v.vehicleName] = parseFloat(total.toFixed(2));
      item[`${v.vehicleName}_pricePerMile`] = parseFloat(perMile.toFixed(2));

      row[`${v.vehicleName}_total`] = (
        <div className="text-sm">
          <div className="text-blue-600 font-semibold">£{perMile.toFixed(2)}</div>
          <div className="text-gray-400 text-xs">x {slabDistance} miles</div>
        </div>
      );
    });

    return row;
  });

  return (
    <>
      <OutletHeading name="Mileage Slab" />

      <div className="mb-6">
        <button className="btn btn-edit" onClick={handleAddSlab}>
          Add Distance Slab
        </button>
      </div>

      <CustomTable
        tableHeaders={tableHeaders}
        tableData={tableData}
        showPagination={true}
        showSorting={true}
      />

      <div className="mt-4 text-right">
        <button className="btn btn-primary" onClick={handleSaveAll}>
          Update Pricing
        </button>
      </div>
    </>
  );
};

export default DistanceSlab;
