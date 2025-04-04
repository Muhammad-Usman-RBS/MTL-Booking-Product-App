import React from "react";

const AuditModal = ({ auditData }) => {
  return (
    <>
      <div className="flex justify-between items-center border-b border-gray-200">
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">Updated By</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {auditData.length > 0 ? (
                auditData.map((entry, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {entry.updatedBy}
                    </td>
                    <td className="px-6 py-3 text-gray-700">{entry.status}</td>
                    <td className="px-6 py-3 text-gray-500">{entry.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AuditModal;
