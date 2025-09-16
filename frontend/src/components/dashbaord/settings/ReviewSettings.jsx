import React, { useEffect, useState } from "react";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  useGetReviewSettingsQuery,
  useUpdateReviewSettingsMutation,
} from "../../../redux/api/reviewsApi";
import { useLoading } from "../../common/LoadingProvider";

const ReviewSettings = () => {
  const {showLoading, hideLoading}= useLoading()
  const companyId = useSelector((s) => s?.auth?.user?.companyId);

  const { data, isLoading, isError, error } = useGetReviewSettingsQuery(companyId, {
    skip: !companyId,
  });
  const [updateSettings, { isLoading: isSaving }] =
    useUpdateReviewSettingsMutation();

  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState("");
  const [reviewLink, setReviewLink] = useState(""); // NEW

    useEffect(()=> {
         if(isLoading) {
           showLoading()
         } else {
           hideLoading()
         }
       },[isLoading])

  useEffect(() => {
    if (isError && error) {
      toast.error(error?.data?.message || "Failed to load settings");
    }
  }, [isError, error]);

  useEffect(() => {
    if (data?.settings) {
      setSubject(data.settings.subject || "");
      setTemplate(data.settings.template || "");
      setReviewLink(data.settings.reviewLink || ""); // NEW
    }
  }, [data]);

  const handleUpdate = async () => {
    if (!companyId) return toast.error("Missing companyId");
    if (!subject.trim()) return toast.error("Subject is required");
    if (!template.trim()) return toast.error("Template is required");
    if (!reviewLink.trim()) return toast.error("Google review link is required"); // optional, but recommended

    try {
      await updateSettings({ companyId, subject, template, reviewLink }).unwrap(); // include reviewLink
      toast.success("Review Settings Updated!");
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Save failed");
    }
  };

  return (
    <div>
      <OutletHeading name="Review Settings" />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Review subject
        </label>
        <input
          type="text"
          className="custom_input w-full mt-1"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isLoading || isSaving}
        />

        <label className="block text-sm font-medium mt-5 text-gray-700 mb-1">
          Review template
        </label>
        <textarea
          rows={18}
          className="custom_input w-full"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          disabled={isLoading || isSaving}
        />

        {/* NEW: Review link field */}
        <label className="block text-sm font-medium mt-5 text-gray-700 mb-1">
          Google review link
        </label>
        <input
          type="url"
          className="custom_input w-full"
          value={reviewLink}
          onChange={(e) => setReviewLink(e.target.value)}
          disabled={isLoading || isSaving}
          placeholder="https://g.page/r/...."
        />

        <div className="text-xs text-gray-500 mt-3">
          Supported placeholders:&nbsp;
          <code>!ORDER_NO!</code>, <code>!PASSENGER_NAME!</code>,{" "}
          <code>!PICKUP_DATE_TIME!</code>, <code>!PICKUP!</code>,{" "}
          <code>!DROPOFF!</code>
        </div>

        <button
          className="btn btn-edit mt-4"
          onClick={handleUpdate}
          disabled={isLoading || isSaving}
        >
          {isSaving ? "Saving..." : "UPDATE"}
        </button>
      </div>
    </div>
  );
};

export default ReviewSettings;
