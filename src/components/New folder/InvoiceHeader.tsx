import React from 'react';
import { Building2, Calendar, Hash, Edit3 } from 'lucide-react';

interface InvoiceHeaderProps {
  invoiceNumber: string;
  invoiceDate: string;
  consultantName: string;
  companyAddress: string;
  onEdit?: (field: string, value: string) => void;
  editable?: boolean;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoiceNumber,
  invoiceDate,
  consultantName,
  companyAddress,
  onEdit,
  editable = true
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">INVOICE</h1>
            <p className="text-blue-100 text-lg">Professional Invoice Generation</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-end space-x-2 mb-2">
              <Hash className="w-4 h-4" />
              <span className="text-sm text-blue-200">Invoice Number</span>
            </div>
            <div className="text-2xl font-bold">{invoiceNumber}</div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-end space-x-2 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm text-blue-200">Date</span>
            </div>
            <div className="text-lg font-semibold">{invoiceDate}</div>
          </div>
        </div>
      </div>
      
      {/* Company Info */}
      <div className="mt-8 bg-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">{consultantName}</h2>
            <p className="text-blue-100">{companyAddress}</p>
          </div>
          {editable && (
            <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <Edit3 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
