import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Icons from "../../../assets/icons";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";
import {
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
} from "../../../redux/api/invoiceApi";
import { toast } from "react-toastify";
import { useGetGeneralPricingPublicQuery } from "../../../redux/api/generalPricingApi";
import { useSelector } from "react-redux";

const InvoicePage = () => {
  const { id } = useParams();
  const user = useSelector((state) => state?.auth?.user);
  const companyId = user?.companyId;
  const [updateInvoice] = useUpdateInvoiceMutation();
  const { data: invoiceData } = useGetInvoiceByIdQuery(id);
  const { data: generalPricingData } = useGetGeneralPricingPublicQuery(
    companyId,
    { skip: !companyId }
  );
  const [selectAll, setSelectAll] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [itemDetails, setItemDetails] = useState([]);
  const [billTo, setBillTo] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState("0.00");
  const [deposit, setDeposit] = useState("0.00");
  const [dueDate, setDueDate] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [globalTaxSelection, setGlobalTaxSelection] = useState("No Tax");
  const [itemTaxes, setItemTaxes] = useState({});
  const [itemAmounts, setItemAmounts] = useState([]);
  const [itemNotes, setItemNotes] = useState({});
  const [itemInternalNotes, setItemInternalNotes] = useState({});
  const [taxPercent, setTaxPercent] = useState(0);

  useEffect(() => {
    if (invoiceData?.invoice) {
      const invoice = invoiceData.invoice;

      const customerText = `${invoice.customer?.name || ""}\n${
        invoice.customer?.email || ""
      }\n${invoice.customer?.phone || ""}`;
      setBillTo(customerText);
      const fetchedTaxPercent =
        parseFloat(generalPricingData?.invoiceTaxPercent) || 0;
      setTaxPercent(fetchedTaxPercent);

      setInvoiceDate(
        invoice.invoiceDate?.split("T")[0] ||
          invoice.createdAt?.split("T")[0] ||
          ""
      );

      setDueDate(invoice.items?.[0]?.date?.split("T")[0] || "");

      let taxPercent = 0;
      if (generalPricingData?.invoiceTaxPercent) {
        taxPercent = parseFloat(generalPricingData.invoiceTaxPercent);
      }

      const adjustedItemAmounts =
        invoice.items?.map((item) => {
          const fare = item.fare || 0;
          return item.tax === "Tax" ? fare * (1 + taxPercent / 100) : fare;
        }) || [];

      setItemAmounts(adjustedItemAmounts);

      setNotes(invoice.notes || "");

      const details =
        invoice.items?.map(
          (item) =>
            `${item.bookingId} - ${invoice.customer?.name || ""}\nPickup: ${
              item.pickup
            }\n\nDrop off: ${item.dropoff}`
        ) || [];
      setItemDetails(details);

      // Initialize all item-related states
      const initialItemTaxes = {};
      const initialItemNotes = {};
      const initialItemInternalNotes = {};

      invoice.items?.forEach((item, index) => {
        initialItemTaxes[index] = item.tax || "No Tax";
        initialItemNotes[index] = item.notes || "";
        initialItemInternalNotes[index] = item.internalNotes || "";
      });

      setItemTaxes(initialItemTaxes);
      setItemNotes(initialItemNotes);
      setItemInternalNotes(initialItemInternalNotes);

      setDiscount(invoice.discount || "0.00");
      setDeposit(invoice.deposit || "0.00");
    }
  }, [invoiceData, generalPricingData]);

  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    const updated = {};
    itemDetails.forEach((_, index) => {
      updated[`item${index}`] = newValue;
    });
    setCheckedItems(updated);
  };
  const handleSave = async () => {
    try {
      if (!invoiceData?.invoice) return toast.error("No invoice data found.");

      const originalItems = invoiceData.invoice.items || [];
      const items = itemDetails.map((text, index) => {
        const lines = text.split("\n").filter(Boolean);
        const bookingLine = lines[0] || "";
        const pickupLine = lines[1] || "";
        const dropoffLine = lines[3] || "";

        const bookingId = bookingLine.split(" - ")[0]?.trim() || "";
        const pickup = pickupLine.replace("Pickup: ", "").trim();
        const dropoff = dropoffLine.replace("Drop off: ", "").trim();

        const original = originalItems[index] || {};

        return {
          bookingId: bookingId || original.bookingId || "",
          pickup: pickup || original.pickup || "",
          dropoff: dropoff || original.dropoff || "",
          totalAmount:
            parseFloat(itemAmounts[index]) || original.totalAmount || 0,
          tax: itemTaxes[index] || original.tax || "No Tax",
          fare: original.fare || 0,
          date: dueDate ? new Date(dueDate) : original.date || new Date(),
          notes: itemNotes[index] || original.notes || "",
          internalNotes:
            itemInternalNotes[index] || original.internalNotes || "",
        };
      });

      const hasMissingDropoff = items.some((item) => !item.dropoff);
      if (hasMissingDropoff) {
        toast.error("Dropoff address is required for all items.");
        return;
      }

      const [name = "", email = "", phone = ""] = billTo.split("\n");
      const original = invoiceData.invoice;

      const updatePayload = {
        invoiceDate:
          invoiceDate !== original.createdAt?.split("T")[0]
            ? invoiceDate
            : undefined,
        dueDate:
          dueDate !== original.items?.[0]?.date?.split("T")[0]
            ? dueDate
            : undefined,
        items:
          JSON.stringify(items) !== JSON.stringify(original.items)
            ? items
            : undefined,
        customer:
          name.trim() !== original.customer?.name ||
          email.trim() !== original.customer?.email ||
          phone.trim() !== original.customer?.phone
            ? {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
              }
            : undefined,
        notes: notes !== original.notes ? notes : undefined,
        discount:
          parseFloat(discount) !== original.discount
            ? parseFloat(discount)
            : undefined,
        deposit:
          parseFloat(deposit) !== original.deposit
            ? parseFloat(deposit)
            : undefined,
        status,
      };

      // Remove undefined values
      Object.keys(updatePayload).forEach(
        (key) => updatePayload[key] === undefined && delete updatePayload[key]
      );

      await updateInvoice({ id, invoiceData: updatePayload }).unwrap();

      toast.success("Invoice updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update invoice");
    }
  };

  const handleCheckboxChange = (item) => {
    const updated = {
      ...checkedItems,
      [item]: !checkedItems[item],
    };
    setCheckedItems(updated);
    setSelectAll(Object.values(updated).every(Boolean));
  };

  return (
    <>
      <OutletHeading name="Edit Invoice" />

      <div className="p-2 md:p-6 max-w-6xl mx-auto bg-gradient-to-b from-gray-50 to-white shadow-md rounded-3xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b  border-[var(--light-gray)] pb-2">
          <h1 className="text-xl font-extrabold text-[var(--dark-gray)] pt-3 pb-3">
            Invoice #{invoiceData?.invoice?.invoiceNumber || "Loading..."}
          </h1>
          <Link to="/dashboard/invoices/list">
            <button className="btn btn-reset">Back to Invoices</button>
          </Link>
        </div>

        <div className="bg-white p-2 md:p-6 rounded-2xl shadow mb-4 border  border-[var(--light-gray)]">
          <label className="block font-bold text-gray-700 mb-2 text-lg">
            Bill To
          </label>
          <textarea
            className="custom_input"
            rows={3}
            value={billTo}
            onChange={(e) => setBillTo(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Invoice Date
            </label>
            <input
              type="date"
              className="custom_input"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              className="custom_input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white p-2 md:p-6 rounded-2xl shadow mb-4  border-[var(--light-gray)] border">
          {/* Top Row: Select All & Global Apply */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-3 text-blue-800 font-semibold">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="accent-blue-600"
              />
              <span>Select All</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <p className="text-sm my-auto text-gray-500">
                Current Tax Rate: <strong>{taxPercent}%</strong>
              </p>

              <SelectOption
                width="w-full md:w-32"
                options={["No Tax", "Tax"]}
                value={globalTaxSelection}
                onChange={(e) => {
                  const value = e.target.value;
                  setGlobalTaxSelection(value);

                  let anyChecked = false;
                  const updatedTaxes = { ...itemTaxes };
                  const updatedAmounts = [...itemAmounts];
                  const taxRate = 1 + taxPercent / 100;

                  Object.keys(checkedItems).forEach((key) => {
                    if (checkedItems[key]) {
                      const itemIndex = parseInt(key.replace("item", ""));
                      const currentAmount =
                        parseFloat(itemAmounts[itemIndex]) || 0;

                      // Reverse existing tax if necessary
                      const wasTaxed = itemTaxes[itemIndex] === "Tax";
                      let baseAmount = currentAmount;

                      if (wasTaxed && value === "No Tax") {
                        baseAmount = currentAmount / taxRate;
                      } else if (!wasTaxed && value === "Tax") {
                        baseAmount = currentAmount * taxRate;
                      }

                      updatedTaxes[itemIndex] = value;
                      updatedAmounts[itemIndex] = baseAmount;
                      anyChecked = true;
                    }
                  });

                  if (anyChecked) {
                    setItemTaxes(updatedTaxes);
                    setItemAmounts(updatedAmounts);
                    toast.success(`Applied "${value}" to selected bookings.`);
                  } else {
                    toast.warn(
                      "No rows selected. Please select bookings to apply tax."
                    );
                  }
                }}
              />
            </div>
          </div>

          {/* Each Item Block */}
          {itemDetails.map((details, index) => {
            const taxApplied = itemTaxes[index] === "Tax";
            const adjustedAmount = parseFloat(itemAmounts[index]) || 0;

            return (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-4 items-start md:items-center  border-[var(--light-gray)] border-t pt-4 mt-4"
              >
                {/* Checkbox */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checkedItems[`item${index}`] || false}
                    onChange={() => handleCheckboxChange(`item${index}`)}
                    className="accent-blue-600"
                  />
                </div>

                {/* Booking details */}
                <div className="flex-1 w-full text-sm text-gray-700">
                  <textarea
                    rows={3}
                    className="w-full border border-[var(--light-gray)] rounded-lg p-2"
                    value={details}
                    onChange={(e) => {
                      const newDetails = [...itemDetails];
                      newDetails[index] = e.target.value;
                      setItemDetails(newDetails);
                    }}
                  />
                  {taxApplied && (
                    <p className="text-green-600 text-xs mt-1 font-semibold">
                      Tax is already applied (included in total).
                    </p>
                  )}
                </div>

                <SelectOption
                  width="w-full md:w-32"
                  options={["No Tax", "Tax"]}
                  value={itemTaxes[index] || "No Tax"}
                  onChange={(e) => {
                    const value = e.target.value;
                    const updatedTaxes = { ...itemTaxes, [index]: value };

                    const updatedAmounts = [...itemAmounts];
                    const currentAmount = parseFloat(itemAmounts[index]) || 0;

                    const taxRate = 1 + taxPercent / 100;

                    if (value === "No Tax" && itemTaxes[index] === "Tax") {
                      updatedAmounts[index] = currentAmount / taxRate;
                    } else if (
                      value === "Tax" &&
                      itemTaxes[index] === "No Tax"
                    ) {
                      updatedAmounts[index] = currentAmount * taxRate;
                    }

                    setItemTaxes(updatedTaxes);
                    setItemAmounts(updatedAmounts);
                    toast.success(
                      `Updated tax for item ${index + 1} to "${value}"`
                    );
                  }}
                />

                <div className="w-full md:w-32">
                  <input
                    type="text"
                    className="custom_input"
                    value={parseFloat(adjustedAmount || 0).toFixed(2)}
                    onChange={(e) => {
                      const updated = [...itemAmounts];
                      updated[index] = e.target.value;
                      setItemAmounts(updated);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-right  mb-4 text-gray-800">
          {/* Sub Total */}
          <p>
            Sub Total:
            <strong className="text-blue-800 ml-1">
              £
              {invoiceData?.invoice?.items?.reduce(
                (acc, item) => acc + (item.fare || 0),
                0
              )}
            </strong>
          </p>

          {/* Discount */}
          <p className="mt-4 flex justify-end items-center gap-2">
            <span className="text-gray-700">Discount:</span>
            <Icons.IndianRupee size={16} className="text-[var(--dark-gray)]" />
            <input
              type="text"
              className="border border-[var(--light-gray)] rounded-lg p-1 w-24 text-right"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </p>

          {/* Deposit */}
          <p className="mt-2 flex justify-end items-center gap-2">
            <span className="text-gray-700">Deposit:</span>
            <Icons.IndianRupee size={16} className="text-[var(--dark-gray)]" />
            <input
              type="text"
              className="border border-[var(--light-gray)] rounded-lg p-1 w-24 text-right"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
            />
          </p>

          {/* Grand Total */}
          <p className="mt-3 text-xl font-bold text-blue-800">
            Total: £
            {(
              itemAmounts.reduce((sum, amt) => sum + parseFloat(amt || 0), 0) -
              parseFloat(discount || 0) +
              parseFloat(deposit || 0)
            ).toFixed(2)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow mb-6  border-[var(--light-gray)] border">
          <ul className="grid  grid-cols-1 md:grid-cols-2 gap-6 list-inside">
            {itemDetails.map((_, index) => {
              const bookingId =
                invoiceData?.invoice?.items?.[index]?.bookingId ||
                `#${index + 1}`;

              return (
                <li
                  key={index}
                  className="border  border-[var(--light-gray)] rounded-xl p-4 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3 gap-1">
                    <span className="font-semibold text-gray-800">
                      {index + 1}.
                    </span>
                    <span className="text-md font-semibold text-gray-800">
                      Booking ID: 
                      <span className="ml-1 text-blue-700">{bookingId}</span>
                    </span>
                  </div>

                  {/* Notes */}
                  <div className="flex items-center gap-2 w-full">
                    <label className="block text-sm font-bold  text-gray-800 ">
                      Notes:
                    </label>

                    <input
                      className="custom_input  "
                      value={itemNotes[index] || ""}
                      onChange={(e) => {
                        setItemNotes((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }));
                      }}
                      placeholder="Enter note..."
                    />
                  </div>

                  {/* Internal Notes */}
                  <div className="flex items-center gap-2 w-full">
                    <label className="block whitespace-nowrap text-sm font-bold  text-gray-800">
                      Internal Notes:
                    </label>

                    <input
                      className="custom_input"
                      value={itemInternalNotes[index] || ""}
                      onChange={(e) => {
                        setItemInternalNotes((prev) => ({
                          ...prev,
                          [index]: e.target.value,
                        }));
                      }}
                      placeholder="Enter internal note..."
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="text-right">
          <button className="btn btn-success" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default InvoicePage;
