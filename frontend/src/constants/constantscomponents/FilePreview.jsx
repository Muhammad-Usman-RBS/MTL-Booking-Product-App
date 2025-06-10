import React from "react";
import Icons from "../../assets/icons";

const FilePreview = ({
    file,
    previewUrl,
    previewName,
    formDataFile,
    label,
    name,
    onChange,
}) => {
    const getFilenameFromUrl = (url) => {
        if (!url) return "";
        return decodeURIComponent(url.substring(url.lastIndexOf("/") + 1).split("?")[0]);
    };

    const fileUrl =
        file instanceof File
            ? URL.createObjectURL(file)
            : previewUrl || (formDataFile && formDataFile.url) || null;

    const fileName =
        file?.name ||
        previewName ||
        (formDataFile && formDataFile.name) ||
        getFilenameFromUrl(previewUrl) ||
        "";

    const isPdf = (f, url) => {
        if (f instanceof File) return f.type === "application/pdf";
        if (typeof url === "string") return url.toLowerCase().endsWith(".pdf");
        return false;
    };

    const fileIsPdf = isPdf(file, null);
    const previewIsPdf = isPdf(null, previewUrl);

    // Decide if we have a file or only URL
    const hasFile = Boolean(file);
    const hasFileUrl = Boolean(fileUrl);

    // Render PDF preview box
    const renderPdfPreview = () => (
        <div className="w-36 h-24 flex flex-col items-center justify-center border-gray-300 border-2 bg-gray-100">
            <Icons.FileText className="w-10 h-10 text-red-600" />
            <p className="text-xs text-black mt-1 px-2 text-center break-all">
                {fileName || "PDF File"}
            </p>
        </div>
    );

    // Render image preview box
    const renderImagePreview = () => (
        <img
            src={fileUrl}
            alt={fileName}
            className="w-36 h-36 object-cover border-gray-300 border-2"
        />
    );

    // Render no file uploaded box
    const renderNoFile = () => (
        <div className="w-36 h-36 border border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-xs font-light">
            No File Uploaded
        </div>
    );

    // Main preview logic
    let previewContent = null;
    if (hasFile) {
        previewContent = fileIsPdf ? renderPdfPreview() : renderImagePreview();
    } else if (hasFileUrl) {
        previewContent = previewIsPdf ? renderPdfPreview() : renderImagePreview();
    } else {
        previewContent = renderNoFile();
    }

    return (
        <div>
            <label>{label}</label>
            <div className="flex mt-2 items-center gap-4">
                {previewContent}

                <div>
                    <input
                        type="file"
                        id={name}
                        name={name}
                        accept="image/*,application/pdf"
                        className="custom_input hidden"
                        onChange={onChange}
                    />
                    <label htmlFor={name} className="btn btn-primary cursor-pointer mt-1">
                        Choose file
                    </label>
                </div>
            </div>
        </div>
    );
};

export default FilePreview;