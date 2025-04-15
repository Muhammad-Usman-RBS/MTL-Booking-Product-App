import React, { useState } from "react";
import Icons from "../../../assets/icons";
import { locationCategoryData } from "../../../constants/dashboardTabsData/data";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import CustomTable from "../../../constants/constantscomponents/CustomTable";
import { toast } from "react-toastify";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

const LocationCategory = () => {
  const [data, setData] = useState(locationCategoryData);
  const [showForm, setShowForm] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [pickupFields, setPickupFields] = useState([]);
  const [dropoffFields, setDropoffFields] = useState([]);

  const defaultField = {
    fieldName: "",
    type: "Optional",
    inputType: "Text Value",
    selectValues: "",
  };

  const handleAddNew = () => {
    setShowForm(true);
    setCategoryName("");
    setPickupFields([]);
    setDropoffFields([]);
  };

  const handleAddPickupField = () => {
    setPickupFields([...pickupFields, { ...defaultField }]);
  };

  const handleAddDropoffField = () => {
    setDropoffFields([...dropoffFields, { ...defaultField }]);
  };

  const handleFieldChange = (list, setList, index, key, value) => {
    const updated = [...list];
    updated[index][key] = value;
    setList(updated);
  };

  const handleRemoveField = (list, setList, index) => {
    const updated = [...list];
    updated.splice(index, 1);
    setList(updated);
  };

  const handleSubmit = () => {
    if (!categoryName) return toast.error("Category Name is required!");
    setData([
      ...data,
      {
        category: categoryName,
        locations: pickupFields.length + dropoffFields.length,
      },
    ]);
    toast.success("Location Category Added!");
    setShowForm(false);
  };

  const handleEdit = (item) => {
    // Add edit logic
  };

  const handleDelete = (category) => {
    setData(data.filter((item) => item.category !== category));
    toast.success("Location Category Deleted!");
  };

  const tableHeaders = [
    { label: "Category", key: "category" },
    { label: "No. Of Locations", key: "locations" },
    { label: "Action", key: "actions" },
  ];

  const tableData = data.map((item) => ({
    ...item,
    actions: (
      <div className="flex gap-2">
        <Icons.Pencil
          title="Edit"
          onClick={() => handleEdit(item)}
          className="w-8 h-8 p-2 rounded-md hover:bg-green-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
        <Icons.Trash
          title="Delete"
          onClick={() => handleDelete(item.category)}
          className="w-8 h-8 p-2 rounded-md hover:bg-red-600 hover:text-white text-gray-600 border border-gray-300 cursor-pointer"
        />
      </div>
    ),
  }));

  const renderFields = (fields, setFields, label) => (
    <div className="bg-gray-100 p-4 rounded space-y-4 mt-4">
      <h3 className="font-semibold">{label}:</h3>
      {fields.map((field, idx) => (
        <div key={idx} className="grid grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-sm">Additional Field *</label>
            <input
              type="text"
              className="custom_input"
              value={field.fieldName}
              onChange={(e) =>
                handleFieldChange(
                  fields,
                  setFields,
                  idx,
                  "fieldName",
                  e.target.value
                )
              }
            />
          </div>
          <div>
            <label className="text-sm">Type *</label>
            <SelectOption width="full" options={["Optional", "Required"]} />
          </div>
          <div>
            <label className="text-sm">Input Type *</label>
            <SelectOption width="full" options={["Text Value", "Select Box"]} />
          </div>
          <div>
            <label className="text-sm">Select Values *</label>
            <input
              type="text"
              className="custom_input"
              placeholder="Comma separated"
              value={field.selectValues}
              onChange={(e) =>
                handleFieldChange(
                  fields,
                  setFields,
                  idx,
                  "selectValues",
                  e.target.value
                )
              }
            />
          </div>
          <button
            className="text-red-600 border border-red-500 px-3 py-1 rounded hover:bg-red-100"
            onClick={() => handleRemoveField(fields, setFields, idx)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <OutletHeading
        name={showForm ? "Add Location Category" : "Location Category"}
      />

      {showForm ? (
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category Name:
              </label>
              <input
                type="text"
                className="custom_input mt-2"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>
            <div>
              <button
                className="btn btn-success"
                onClick={() => setShowForm(false)}
              >
                Location Category List
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button className="btn btn-primary" onClick={handleAddPickupField}>
              Add Pickup Field
            </button>
            <button className="btn btn-edit" onClick={handleAddDropoffField}>
              Add Dropoff Field
            </button>
          </div>

          {renderFields(pickupFields, setPickupFields, "Pickup")}
          {renderFields(dropoffFields, setDropoffFields, "Dropoff")}

          <div className="flex justify-center">
            <button className="btn btn-reset mt-4" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      ) : (
        <>
          <button className="btn btn-edit mb-4" onClick={handleAddNew}>
            Add New
          </button>
          <CustomTable
            tableHeaders={tableHeaders}
            tableData={tableData}
            showPagination={true}
            showSorting={true}
          />
        </>
      )}
    </div>
  );
};

export default LocationCategory;
