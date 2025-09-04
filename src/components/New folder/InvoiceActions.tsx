import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  Send, 
  Save, 
  Eye, 
  Copy,
  FileText,
  Mail,
  Share2
} from 'lucide-react';

interface InvoiceActionsProps {
  onPrint: () => void;
  onSave: () => void;
  onPreview: () => void;
  onExportPDF: () => void;
  onSendEmail: () => void;
  onDuplicate: () => void;
}

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  onPrint,
  onSave,
  onPreview,
  onExportPDF,
  onSendEmail,
  onDuplicate
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const primaryActions = [
    {
      label: 'Save Draft',
      icon: Save,
      onClick: onSave,
      className: 'bg-green-600 hover:bg-green-700 text-white'
    },
    {
      label: 'Preview',
      icon: Eye,
      onClick: onPreview,
      className: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      label: 'Print',
      icon: Printer,
      onClick: onPrint,
      className: 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  ];

  const secondaryActions = [
    {
      label: 'Export PDF',
      icon: Download,
      onClick: onExportPDF,
      className: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    {
      label: 'Send Email',
      icon: Mail,
      onClick: onSendEmail,
      className: 'bg-orange-600 hover:bg-orange-700 text-white'
    },
    {
      label: 'Duplicate',
      icon: Copy,
      onClick: onDuplicate,
      className: 'bg-indigo-600 hover:bg-indigo-700 text-white'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Primary Actions */}
        <div className="flex flex-wrap gap-3">
          {primaryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${action.className}`}
            >
              <action.icon className="w-4 h-4" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap gap-3">
          {secondaryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${action.className}`}
            >
              <action.icon className="w-4 h-4" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
            <div className="font-semibold text-blue-600 dark:text-blue-400">Draft</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-500/10 rounded-lg">
            <Save className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 dark:text-gray-400">Last Saved</div>
            <div className="font-semibold text-green-600 dark:text-green-400">Auto-saved</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
            <Share2 className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 dark:text-gray-400">Format</div>
            <div className="font-semibold text-purple-600 dark:text-purple-400">Professional</div>
          </div>
        </div>
      </div>
    </div>
  );
};
