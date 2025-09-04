import React, { useState } from 'react';
import { PenTool, Edit3, Save, X } from 'lucide-react';

interface InvoiceSignatureProps {
  signatureName: string;
  onSignatureNameChange: (name: string) => void;
}

export const InvoiceSignature: React.FC<InvoiceSignatureProps> = ({
  signatureName,
  onSignatureNameChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(signatureName);

  const handleSave = () => {
    onSignatureNameChange(tempName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(signatureName);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <PenTool className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Authorized Signature</h3>
      </div>

      <div className="flex items-start space-x-6">
        {/* Signature Box */}
        <div className="flex-shrink-0">
          <div className="w-64 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 flex items-center justify-center">
            <div className="text-center">
              <PenTool className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Signature Area</p>
            </div>
          </div>
        </div>

        {/* Signature Name */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Signatory Name
          </label>
          
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter signatory name"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex-1 mr-3">
                <p className="text-gray-900 dark:text-white font-medium">
                  {signatureName || 'Click edit to add signatory name'}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p>• Digital signature will be applied when printing</p>
            <p>• Ensure signatory name matches official records</p>
          </div>
        </div>
      </div>
    </div>
  );
};
