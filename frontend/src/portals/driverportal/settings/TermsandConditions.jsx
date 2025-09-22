import React, { useState } from "react";
import { useSelector } from "react-redux";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { toast } from "react-toastify";
import {
  useCreateTermsAndConditionsMutation,
  useDeleteTermsAndConditionsMutation,
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
} from "../../../redux/api/TermsandConditionsApi";
import Icons from "../../../assets/icons";
import DeleteModal from "../../../constants/constantscomponents/DeleteModal";

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
    } catch (err) {
      console.error("Error submitting term:", err);
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
    setIsCreating(false);
    setEditingId(null);
  };

  const canCreateOrEdit = () =>
    ["superadmin", "clientadmin"].includes(userRole);

  return (
    <div>
      <OutletHeading name="Terms & Conditions" />

      {canCreateOrEdit() && (
        <div className="mb-6">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className=" flex items-center btn btn-success"
            >
              Add New Terms
            </button>
          ) : (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingId ? "Edit Terms" : "Create New Terms"}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 cursor-pointer hover:text-gray-700"
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter title"
                  className="w-full px-3 py-2 border rounded-md"
                />

                <textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  rows={6}
                  placeholder="Enter terms and conditions content"
                  className="w-full px-3 py-2 border rounded-md"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <span>{editingId ? "Update" : "Create"}</span>
                  </button>
                  <button onClick={resetForm} className="btn btn-cancel">
                    Cancel
                  </button>
                </div>
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
              </div>
            </div>
          )}
        </div>
      )}
      <div className="space-y-6">
        {isLoading && <p className="text-gray-500">Loading terms...</p>}
        {error && <p className="text-red-500">Failed to load terms.</p>}

        {data?.data?.length > 0 ? (
          data.data
            .filter((term) => {
              const isTargeted = term.targetAudience?.includes(userRole);
              const isCreator =
                term.createdBy?._id?.toString() === user?._id?.toString() ||
                term.createdBy?.toString() === user?._id?.toString();
              return isTargeted || isCreator;
            })
            .map((term) => (
              <div key={term._id} className="bg-white p-3 shadow-sm relative">
                <h3 className="text-lg font-semibold">{term.title}</h3>
                <p className="text-gray-700 whitespace-pre-wrap mt-2">
                  {term.content}
                </p>

                {canCreateOrEdit() && term.createdBy?._id === user?._id && (
                  <div className="absolute top-4 right-4 flex gap-3">
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
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Icons.Edit className="size-5 cursor-pointer" />
                    </button>
                    <button
                      onClick={async () => {
                        setTermToDelete(term._id);
                        setShowConfirmModal(true);

                        try {
                          await deleteTerm({ id: term._id }).unwrap();
                          refetch();
                        } catch (err) {
                          console.error("Error deleting term:", err);
                          toast.error(
                            "Failed to delete the term. Please try again."
                          );
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Icons.Trash2 className="size-5 cursor-pointer" />
                    </button>
                  </div>
                )}
              </div>
            ))
        ) : (
          <p className="text-gray-500">No terms and conditions found.</p>
        )}
      </div>
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
