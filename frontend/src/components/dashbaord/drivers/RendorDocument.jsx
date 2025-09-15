import React from "react";
import Icons from "../../../assets/icons";

const renderPreview = (fileUrl, label, fileName = "") => {
  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center p-4 bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl border border-sky-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="w-28 h-20 flex items-center justify-center rounded-lg border border-dashed border-sky-300 bg-white">
          <Icons.FileText className="size-8 text-sky-400" />
        </div>
        <p className="mt-3 text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400 italic">No file uploaded</p>
      </div>
    );
  }

  const isImage = /\.(jpeg|jpg|png|webp)$/i.test(fileUrl);
  const isPdf = /\.pdf$/i.test(fileUrl);

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl border border-sky-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      {isImage ? (
        <img
          src={fileUrl}
          alt={label}
          className="w-28 h-20 object-cover rounded-md border border-sky-200"
        />
      ) : (
        isPdf && (
          <div className="w-28 h-20 flex flex-col items-center justify-center rounded-md border border-dashed border-sky-300 bg-white">
            <Icons.FileText className="size-8 text-red-600" />
            {fileName && (
              <p className="text-xs text-gray-500 mt-2 px-2 text-center truncate w-full">
                {fileName}
              </p>
            )}
          </div>
        )
      )}
      <p className="mt-3 text-sm font-semibold text-gray-700">{label}</p>
      {fileName && !isPdf && (
        <p className="text-xs text-gray-500 truncate max-w-[6rem]">{fileName}</p>
      )}
    </div>
  );
};

const renderUploadItem = (filePath, label) => {
  let actualFilePath = "";
  let fileName = "";

  if (typeof filePath === "string") {
    actualFilePath = filePath;
    fileName = filePath.split("/").pop();
  } else if (typeof filePath === "object" && filePath !== null) {
    actualFilePath = filePath.url || "";
    fileName =
      filePath.original_filename ||
      filePath.name ||
      filePath.url?.split("/").pop();
  }

  return renderPreview(actualFilePath || null, label, fileName || "");
};

const RenderDocuments = ({ uploads }) => {
  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderUploadItem(uploads.privateHireCard, "Private Hire Card")}
        {renderUploadItem(uploads.dvlaCard, "DVLA Card")}
        {renderUploadItem(uploads.privateHireCarPaper, "Private Hire Car Paper")}
        {renderUploadItem(uploads.driverPrivateHirePaper, "Driver Private Hire Paper")}
        {renderUploadItem(uploads.insurance, "Insurance")}
        {renderUploadItem(uploads.motExpiry, "MOT Expiry")}
        {renderUploadItem(uploads.V5, "V5")}
      </div>
  );
};

export default RenderDocuments;
