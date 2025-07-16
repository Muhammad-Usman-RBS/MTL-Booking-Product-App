import React from "react";

const EmptyTableMessage = ({ message , colSpan  }) => {
  return [
    {
      customRow: true,
      content: (
        <td
          colSpan={colSpan}
          className="text-center py-2.5 text-[var(--dark-gray)] font-semibold text-md"
        >
          {message}
        </td>
      ),
    },
  ];
};

export default EmptyTableMessage;
