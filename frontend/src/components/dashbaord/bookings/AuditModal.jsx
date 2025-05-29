import React from "react";

const AuditModal = ({ auditData = [] }) => {
  return (
    <div className="">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Updated By</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {auditData.length > 0 ? (
              auditData.map((entry, i) => (
                <tr key={i} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {entry.updatedBy
                      ? entry.updatedBy
                        .split(" ")
                        .map(word =>
                          word
                            .split("|")
                            .map(part => part.trim().charAt(0).toUpperCase() + part.trim().slice(1))
                            .join(" | ")
                        )
                        .join(" ")
                      : "Unknown"}

                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {entry.status || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {entry.date ? new Date(entry.date).toLocaleString() : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                  No audit records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditModal;
