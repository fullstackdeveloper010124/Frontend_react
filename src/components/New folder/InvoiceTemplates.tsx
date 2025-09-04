import React, { useState } from 'react';
import { 
  FileText, 
  Palette, 
  Settings, 
  Eye, 
  Check,
  Briefcase,
  Building,
  Zap,
  Crown
} from 'lucide-react';

interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  preview: string;
}

interface InvoiceTemplatesProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  onCustomize: () => void;
}

export const InvoiceTemplates: React.FC<InvoiceTemplatesProps> = ({
  selectedTemplate,
  onTemplateChange,
  onCustomize
}) => {
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const templates: InvoiceTemplate[] = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, business-focused design with minimal styling',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      borderColor: 'border-blue-200 dark:border-blue-500/20',
      preview: 'Classic layout with company header and structured sections'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design with gradients and modern typography',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      borderColor: 'border-purple-200 dark:border-purple-500/20',
      preview: 'Sleek design with gradient headers and modern spacing'
    },
    {
      id: 'corporate',
      name: 'Corporate',
      description: 'Formal template suitable for large organizations',
      icon: Building,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-500/10',
      borderColor: 'border-gray-200 dark:border-gray-500/20',
      preview: 'Traditional corporate styling with formal structure'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Elegant design with premium styling and branding',
      icon: Crown,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      borderColor: 'border-amber-200 dark:border-amber-500/20',
      preview: 'Luxury styling with elegant typography and gold accents'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Palette className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Templates</h3>
        </div>
        <button
          onClick={onCustomize}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
        >
          <Settings className="w-4 h-4" />
          <span>Customize</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id
                ? `${template.borderColor} ${template.bgColor}`
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            {/* Selection Indicator */}
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2">
                <div className={`w-6 h-6 rounded-full ${template.color.replace('text-', 'bg-')} flex items-center justify-center`}>
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            {/* Template Header */}
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${template.bgColor}`}>
                <template.icon className={`w-5 h-5 ${template.color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{template.description}</p>
              </div>
            </div>

            {/* Template Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
              <p className="text-xs text-gray-600 dark:text-gray-300">{template.preview}</p>
            </div>

            {/* Preview Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(showPreview === template.id ? null : template.id);
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>

            {/* Expanded Preview */}
            {showPreview === template.id && (
              <div className="mt-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded mt-3"></div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Template Features */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Template Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-green-600" />
            <span className="text-gray-600 dark:text-gray-400">Professional layouts</span>
          </div>
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600 dark:text-gray-400">Custom color schemes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-purple-600" />
            <span className="text-gray-600 dark:text-gray-400">Fully customizable</span>
          </div>
        </div>
      </div>
    </div>
  );
};
