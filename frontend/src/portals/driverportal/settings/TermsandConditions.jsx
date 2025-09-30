import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Icons from "../../../assets/icons";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import OutletBtnHeading from "../../../constants/constantscomponents/OutletBtnHeading";
import { useCreateTermsAndConditionsMutation, useDeleteTermsAndConditionsMutation, useGetTermsAndConditionsQuery, useUpdateTermsAndConditionsMutation } from "../../../redux/api/termsAndConditionsApi";

const TermsandConditions = () => {
  const user = useSelector((state) => state?.auth?.user);
  const userRole = user?.role || "";
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [termToDelete, setTermToDelete] = useState(null);
  const [createTerm] = useCreateTermsAndConditionsMutation();
  const { data, isLoading, error, refetch } = useGetTermsAndConditionsQuery();
  const [updateTerm] = useUpdateTermsAndConditionsMutation();
  const [deleteTerm] = useDeleteTermsAndConditionsMutation();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [targetAudience, setTargetAudience] = useState([]);

  const canCreateOrEdit = () =>
    ["superadmin", "clientadmin"].includes(userRole);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.warn("Please fill in all required fields");
      return;
    }
    if (userRole === "clientadmin" && targetAudience.length === 0) {
      toast.warn("Please select at least one target audience");
      return;
    }
    try {
      if (editingId) {
        await updateTerm({
          id: editingId,
          ...formData,
          targetAudience,
        }).unwrap();
      } else {
        await createTerm({ ...formData, targetAudience }).unwrap();
      }
      resetForm();
      refetch();
    } catch (err) {
      console.error("Error submitting term:", err);
      toast.error("Failed to save the term. Please try again.");
    }
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setTargetAudience((prev) => [...prev, value]);
    } else {
      setTargetAudience((prev) => prev.filter((item) => item !== value));
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "" });
    setTargetAudience([]);
    setIsCreating(false);
    setEditingId(null);
  };

  const getAudienceLabel = (role, targetAudience = [], userRole) => {
    if (role === "superadmin") return "For Admins";

    if (role === "clientadmin" || role === "associateadmin") {
      if (userRole === "driver" && targetAudience.includes("driver")) {
        return "For Drivers";
      }
      if (userRole === "customer" && targetAudience.includes("customer")) {
        return "For Customers";
      }
      if (["clientadmin", "associateadmin"].includes(userRole)) {
        if (
          targetAudience.includes("driver") &&
          targetAudience.includes("customer")
        ) {
          return "For Drivers & Customers";
        }
        if (targetAudience.includes("driver")) {
          return "For Drivers";
        }
        if (targetAudience.includes("customer")) {
          return "For Customers";
        }
        if (targetAudience.includes("associateadmin")) {
          return "For Associate Admins";
        }
      }
    }

    return "";
  };

  return (
    <div>
      {/* Header / Form */}
      <div className="mb-4">
        {!isCreating ? (
          userRole === "driver" || userRole === "customer" ? (
            <>
              <OutletHeading name="Terms & Conditions" />
              <p className="text-sm text-gray-600">
                Please review the latest terms and conditions.
              </p>
            </>
          ) : canCreateOrEdit() ? (
            <>
              <OutletBtnHeading
                name="Terms & Conditions"
                buttonLabel="+ Add New Terms"
                buttonBg="btn btn-edit"
                onButtonClick={() => setIsCreating(true)}
              />
              <p className="text-sm text-gray-600">
                You can create and share Terms & Conditions for your drivers and
                customers.
              </p>
            </>
          ) : (
            <OutletHeading name="Terms & Conditions" />
          )
        ) : (
          <>
            <OutletBtnHeading
              name="Terms & Conditions"
              buttonLabel="← Back to Terms List"
              buttonBg="btn btn-back"
              onButtonClick={resetForm}
            />
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-[var(--dark-gray)] mb-4">
                {editingId ? "Edit Terms" : "Create New Terms"}
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter title"
                  className="custom_input"
                />

                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={6}
                  placeholder="Enter terms and conditions content"
                  className="custom_input"
                />

                {userRole === "clientadmin" && (
                  <div className="mb-4">
                    <label className="block font-semibold mb-2">
                      Target Audience:
                    </label>
                    <div className="flex gap-4">
                      {["driver", "customer", "associateadmin"].map((role) => (
                        <label
                          key={role}
                          className="inline-flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            value={role}
                            checked={targetAudience.includes(role)}
                            onChange={handleCheckboxChange}
                            className="form-checkbox"
                          />
                          <span className="capitalize">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    onClick={handleSubmit}
                    className="btn btn-success inline-flex items-center gap-2"
                  >
                    <span>{editingId ? "Update" : "Create"}</span>
                  </button>
                  <button onClick={resetForm} className="btn btn-cancel">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {!isCreating && (
        <div className="space-y-6">
          {isLoading && <p className="text-gray-500">Loading terms...</p>}
          {error && <p className="text-red-500">Failed to load terms.</p>}

          {data?.data?.length > 0 ? (
            data.data
              .filter((term) => {
                const createdByRole = term.createdBy?.role;

                if (
                  createdByRole === "superadmin" &&
                  ["superadmin", "clientadmin"].includes(userRole)
                ) {
                  return true;
                }

                if (["clientadmin", "associateadmin"].includes(createdByRole)) {
                  if (["clientadmin", "associateadmin"].includes(userRole))
                    return true;
                  if (term.targetAudience?.includes(userRole)) return true;
                }

                const isTargeted = term.targetAudience?.includes(userRole);
                const isCreator =
                  term.createdBy?._id?.toString() === user?._id?.toString() ||
                  term.createdBy?.toString() === user?._id?.toString();
                return isTargeted || isCreator || canCreateOrEdit();
              })
              .map((term) => (
                <article
                  key={term._id}
                  className="bg-white border-l-4 border-l-[var(--main-color)] rounded-xl shadow-md hover:shadow-lg transition-all duration-300 px-4 sm:px-6 flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row justify-between w-full gap-4 mt-4">
                    <div className="flex gap-3 flex-1">
                      <div className="flex-shrink-0">
                        <Icons.FileSignature className="w-6 h-6 text-[var(--main-color)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--navy-blue)] text-base truncate">
                          {term.title || "Untitled Term"}
                        </h3>
                        <p className="text-sm mt-1 text-[var(--dark-grey)] leading-snug whitespace-pre-wrap">
                          {term.content}
                        </p>
                      </div>
                    </div>

                    {canCreateOrEdit() && term.createdBy?._id === user?._id && (
                      <div className="flex gap-2 self-start sm:self-center">
                        <button
                          onClick={() => {
                            setEditingId(term._id);
                            setFormData({
                              title: term.title,
                              content: term.content,
                            });
                            setTargetAudience(term.targetAudience || []);
                            setIsCreating(true);
                          }}
                          className="p-2 rounded-lg cursor-pointer hover:bg-[var(--light-blue)] text-[var(--main-color)] transition-colors"
                          title="Edit"
                        >
                          <Icons.Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={async () => {
                            setTermToDelete(term._id);
                            setShowConfirmModal(true);
                          }}
                          className="p-2 rounded-lg cursor-pointer hover:bg-red-100 text-[var(--alert-red)] transition-colors"
                          title="Delete"
                        >
                          <Icons.Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bottom Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 border-t border-[var(--light-gray)] pb-3 pt-2">
                    <time className="text-xs text-[var(--dark-grey)] italic">
                      {term.createdAt
                        ? new Date(term.createdAt).toLocaleDateString()
                        : "—"}
                    </time>
                    <span className="text-xs text-white bg-[var(--main-color)] px-2 py-1 rounded-md mt-2 sm:mt-0">
                      {getAudienceLabel(
                        term.createdBy?.role,
                        term.targetAudience,
                        userRole
                      )}
                    </span>
                  </div>
                </article>
              ))
          ) : (
            <p className="text-gray-500 underline">No terms and conditions found.</p>
          )}
        </div>
      )}

      <DeleteModal
        isOpen={showConfirmModal}
        onConfirm={async () => {
          try {
            await deleteTerm({ id: termToDelete }).unwrap();
            refetch();
            toast.success("Term deleted successfully");
          } catch (err) {
            console.error("Error deleting term:", err);
            toast.error("Failed to delete the term. Please try again.");
          } finally {
            setShowConfirmModal(false);
            setTermToDelete(null);
          }
        }}
        onCancel={() => {
          setShowConfirmModal(false);
          setTermToDelete(null);
        }}
      />
    </div>
  );
};

export default TermsandConditions;