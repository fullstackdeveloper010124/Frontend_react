import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Image,
  Calendar,
  Settings,
  X,
  Check
} from 'lucide-react';

interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel' | 'png';
  dateRange: string;
  includeCharts: boolean;
  includeDetails: boolean;
  customFields: string[];
}

interface ReportsExportProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  availableFields: string[];
}

export const ReportsExport: React.FC<ReportsExportProps> = ({
  isOpen,
  onClose,
  onExport,
  availableFields
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: 'current',
    includeCharts: true,
    includeDetails: true,
    customFields: []
  });

  const formatOptions = [
    { 
      value: 'pdf', 
      label: 'PDF Report', 
      icon: FileText, 
      description: 'Professional formatted report',
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-500/10'
    },
    { 
      value: 'csv', 
      label: 'CSV Data', 
      icon: FileSpreadsheet, 
      description: 'Raw data for analysis',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-500/10'
    },
    { 
      value: 'excel', 
      label: 'Excel Workbook', 
      icon: FileSpreadsheet, 
      description: 'Formatted spreadsheet with charts',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10'
    },
    { 
      value: 'png', 
      label: 'Chart Image', 
      icon: Image, 
      description: 'Visual charts only',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10'
    }
  ];

  const dateRangeOptions = [
    { value: 'current', label: 'Current Filter Range' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const handleExport = () => {
    onExport(exportOptions);
    onClose();
  };

  const handleFieldToggle = (field: string) => {
    const newFields = exportOptions.customFields.includes(field)
      ? exportOptions.customFields.filter(f => f !== field)
      : [...exportOptions.customFields, field];
    
    setExportOptions(prev => ({
      ...prev,
      customFields: newFields
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Download className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Export Report</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Format Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Export Format</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formatOptions.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setExportOptions(prev => ({ ...prev, format: format.value as any }))}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      exportOptions.format === format.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${format.bgColor}`}>
                        <format.icon className={`w-5 h-5 ${format.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {format.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format.description}
                        </div>
                      </div>
                      {exportOptions.format === format.value && (
                        <Check className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Date Range</h3>
              <select
                value={exportOptions.dateRange}
                onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Options */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Content Options</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeCharts}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Include Charts</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Add visual charts and graphs to the report
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeDetails}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeDetails: e.target.checked }))}
                    className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Include Detailed Data</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Include raw data tables and detailed breakdowns
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Fields */}
            {exportOptions.format !== 'png' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Custom Fields</h3>
                <div className="grid grid-cols-2 gap-3">
                  {availableFields.map(field => (
                    <label key={field} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportOptions.customFields.includes(field)}
                        onChange={() => handleFieldToggle(field)}
                        className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{field}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Preview</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Format: <span className="font-medium">{formatOptions.find(f => f.value === exportOptions.format)?.label}</span></div>
                <div>Date Range: <span className="font-medium">{dateRangeOptions.find(d => d.value === exportOptions.dateRange)?.label}</span></div>
                <div>Charts: <span className="font-medium">{exportOptions.includeCharts ? 'Included' : 'Excluded'}</span></div>
                <div>Details: <span className="font-medium">{exportOptions.includeDetails ? 'Included' : 'Excluded'}</span></div>
                {exportOptions.customFields.length > 0 && (
                  <div>Custom Fields: <span className="font-medium">{exportOptions.customFields.length} selected</span></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
