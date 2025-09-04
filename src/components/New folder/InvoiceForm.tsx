import React, { useState } from 'react';
import { User, MapPin, Edit3, Save, X } from 'lucide-react';

interface InvoiceFormProps {
  billTo: string;
  onBillToChange: (value: string) => void;
  bankDetails: string;
  onBankDetailsChange: (value: string) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  billTo,
  onBillToChange,
  bankDetails,
  onBankDetailsChange
}) => {
  const [editingBillTo, setEditingBillTo] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [tempBillTo, setTempBillTo] = useState(billTo);
  const [tempBankDetails, setTempBankDetails] = useState(bankDetails);

  const handleSaveBillTo = () => {
    onBillToChange(tempBillTo);
    setEditingBillTo(false);
  };

  const handleCancelBillTo = () => {
    setTempBillTo(billTo);
    setEditingBillTo(false);
  };

  const handleSaveBank = () => {
    onBankDetailsChange(tempBankDetails);
    setEditingBank(false);
  };

  const handleCancelBank = () => {
    setTempBankDetails(bankDetails);
    setEditingBank(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Bill To Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bill To</h3>
          </div>
          {!editingBillTo && (
            <button
              onClick={() => setEditingBillTo(true)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>

        {editingBillTo ? (
          <div className="space-y-4">
            <textarea
              value={tempBillTo}
              onChange={(e) => setTempBillTo(e.target.value)}
              placeholder="Enter client information..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveBillTo}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelBillTo}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-32">
            {billTo ? (
              <div className="whitespace-pre-wrap text-gray-900 dark:text-white">
                {billTo}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 italic">
                Click edit to add client information
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bank Details Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bank Details</h3>
          </div>
          {!editingBank && (
            <button
              onClick={() => setEditingBank(true)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/20 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>

        {editingBank ? (
          <div className="space-y-4">
            <textarea
              value={tempBankDetails.replace(/<[^>]*>/g, '\n').replace(/\n+/g, '\n').trim()}
              onChange={(e) => setTempBankDetails(e.target.value.split('\n').map(line => `<p>${line}</p>`).join(''))}
              placeholder="Enter bank details..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveBank}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelBank}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-32">
            <div 
              className="text-gray-900 dark:text-white text-sm"
              dangerouslySetInnerHTML={{ __html: bankDetails }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
