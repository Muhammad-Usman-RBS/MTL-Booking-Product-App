import React from "react";

const InvoiceEmailModal = ({
  recipient,
  subject,
  message,
  onChangeRecipient,
  onChangeSubject,
  onChangeMessage,
  onSend,
}) => {
  return (
    <div className="space-y-4 p-3 w-96">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Recipient:
        </label>
        <input
          type="email"
          value={recipient}
          onChange={onChangeRecipient}
          className="mt-1 w-full border border-[var(--light-gray)] rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Subject:
        </label>
        <input
          type="text"
          value={subject}
          onChange={onChangeSubject}
          className="mt-1 w-full border border-[var(--light-gray)] rounded px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Message:
        </label>
        <textarea
          rows={8}
          value={message}
          onChange={onChangeMessage}
          className="mt-1 w-full border border-[var(--light-gray)] rounded px-3 py-2 text-sm font-mono whitespace-pre-wrap focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onSend}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default InvoiceEmailModal;
