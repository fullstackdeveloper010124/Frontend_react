import React, { useState } from 'react';
import { 
  Palette, 
  Type, 
  Layout, 
  Image, 
  Save, 
  RotateCcw,
  Upload,
  Eye,
  X
} from 'lucide-react';

interface CustomizationSettings {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: string;
  logoUrl: string;
  headerStyle: string;
  borderStyle: string;
  spacing: string;
}

interface InvoiceCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CustomizationSettings;
  onSettingsChange: (settings: CustomizationSettings) => void;
}

export const InvoiceCustomization: React.FC<InvoiceCustomizationProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState<CustomizationSettings>(settings);

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500' },
    { name: 'Purple', value: '#8B5CF6', bg: 'bg-purple-500' },
    { name: 'Green', value: '#10B981', bg: 'bg-green-500' },
    { name: 'Red', value: '#EF4444', bg: 'bg-red-500' },
    { name: 'Orange', value: '#F97316', bg: 'bg-orange-500' },
    { name: 'Gray', value: '#6B7280', bg: 'bg-gray-500' }
  ];

  const fontOptions = [
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' }
  ];

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: CustomizationSettings = {
      primaryColor: '#3B82F6',
      accentColor: '#8B5CF6',
      fontFamily: 'Inter, sans-serif',
      fontSize: 'medium',
      logoUrl: '',
      headerStyle: 'modern',
      borderStyle: 'rounded',
      spacing: 'normal'
    };
    setLocalSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Palette className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Customize Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-full">
          {/* Settings Panel */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Colors Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Palette className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Colors</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Primary Color
                    </label>
                    <div className="flex space-x-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setLocalSettings(prev => ({ ...prev, primaryColor: color.value }))}
                          className={`w-8 h-8 rounded-lg ${color.bg} border-2 ${
                            localSettings.primaryColor === color.value 
                              ? 'border-gray-900 dark:border-white' 
                              : 'border-transparent'
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Accent Color
                    </label>
                    <div className="flex space-x-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setLocalSettings(prev => ({ ...prev, accentColor: color.value }))}
                          className={`w-8 h-8 rounded-lg ${color.bg} border-2 ${
                            localSettings.accentColor === color.value 
                              ? 'border-gray-900 dark:border-white' 
                              : 'border-transparent'
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Type className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Typography</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Family
                    </label>
                    <select
                      value={localSettings.fontFamily}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {fontOptions.map((font) => (
                        <option key={font.value} value={font.value}>{font.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Size
                    </label>
                    <select
                      value={localSettings.fontSize}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, fontSize: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Layout Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Layout className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Layout</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Header Style
                    </label>
                    <select
                      value={localSettings.headerStyle}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, headerStyle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="classic">Classic</option>
                      <option value="modern">Modern</option>
                      <option value="minimal">Minimal</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Border Style
                    </label>
                    <select
                      value={localSettings.borderStyle}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, borderStyle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="none">None</option>
                      <option value="rounded">Rounded</option>
                      <option value="sharp">Sharp</option>
                      <option value="dashed">Dashed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Spacing
                    </label>
                    <select
                      value={localSettings.spacing}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, spacing: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Logo Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Image className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Logo</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={localSettings.logoUrl}
                      onChange={(e) => setLocalSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 bg-gray-50 dark:bg-gray-900 p-6 border-l border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Preview</h3>
            </div>
            
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full overflow-y-auto"
              style={{ 
                fontFamily: localSettings.fontFamily,
                fontSize: localSettings.fontSize === 'small' ? '14px' : localSettings.fontSize === 'large' ? '18px' : '16px'
              }}
            >
              {/* Preview Content */}
              <div className="space-y-4">
                <div 
                  className="text-center p-4 rounded-lg"
                  style={{ backgroundColor: localSettings.primaryColor + '20', color: localSettings.primaryColor }}
                >
                  <h1 className="text-2xl font-bold">INVOICE</h1>
                  <p className="text-sm opacity-80">Your Company Name</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Invoice #: INV-2024-001</p>
                    <p className="text-gray-600 dark:text-gray-400">Date: January 5, 2024</p>
                  </div>
                  <div>
                    <p className="font-medium">Bill To:</p>
                    <p className="text-gray-600 dark:text-gray-400">Client Name<br />Client Address</p>
                  </div>
                </div>
                
                <div 
                  className="border rounded-lg p-3"
                  style={{ 
                    borderColor: localSettings.accentColor + '40',
                    borderRadius: localSettings.borderStyle === 'sharp' ? '0' : localSettings.borderStyle === 'rounded' ? '8px' : '4px'
                  }}
                >
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium mb-2">
                    <div>Description</div>
                    <div>Qty</div>
                    <div>Rate</div>
                    <div>Total</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>Sample Service</div>
                    <div>1</div>
                    <div>$100.00</div>
                    <div>$100.00</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold" style={{ color: localSettings.primaryColor }}>
                    Total: $100.00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
