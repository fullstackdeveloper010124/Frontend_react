import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from "@/components/Sidebar/AdminSidebar";
import { Header } from "@/components/navbar/AdminHeader";
import { ThemeProvider } from '@/components/New folder/ThemeProvider';
import { InvoiceHeader } from '@/components/New folder/InvoiceHeader';
import { InvoiceForm } from '@/components/New folder/InvoiceForm';
import { InvoiceTable } from '@/components/New folder/InvoiceTable';
import { InvoiceActions } from '@/components/New folder/InvoiceActions';
import { InvoiceSignature } from '@/components/New folder/InvoiceSignature';
import { InvoiceTemplates } from '@/components/New folder/InvoiceTemplates';
import { InvoiceCustomization } from '@/components/New folder/InvoiceCustomization';

// Define the type for a single task item in the invoice table
interface InvoiceTask {
  id: string; // Unique ID for React keys
  qty: number | string;
  desc: string;
  unit: number | string;
  total: number;
}

const Invoice: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar

  // State for invoice details
  const [invoiceNumber] = useState(`INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`);
  const [invoiceDate] = useState(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  const [consultantName] = useState('Your Company Name');
  const [companyAddress] = useState('123 Business Street, City, State 12345');
  const [signatureName, setSignatureName] = useState('Authorized Person');

  // State for editable content
  const [billTo, setBillTo] = useState('');
  const [bankDetails, setBankDetails] = useState(
    'Bank Name: Your Bank\nAccount Holder: Your Company Name\nAccount Number: 1234567890\nRouting Number: 987654321\nAccount Type: Business Checking'
  );

  // Template and customization state
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizationSettings, setCustomizationSettings] = useState({
    primaryColor: '#3B82F6',
    accentColor: '#8B5CF6',
    fontFamily: 'Inter, sans-serif',
    fontSize: 'medium',
    logoUrl: '',
    headerStyle: 'modern',
    borderStyle: 'rounded',
    spacing: 'normal'
  });

  // State for tasks table
  const [tasks, setTasks] = useState<InvoiceTask[]>(() => [
    { id: `task-${Date.now()}-1`, qty: '', desc: '', unit: '', total: 0 }
  ]);

  // Ref for the gross total span to update its content directly
  const grossValueRef = useRef<HTMLSpanElement>(null);

  // Utility to format number to 2-decimal places
  const fmt = useCallback((n: number | string) => {
    return Number(n || 0).toFixed(2);
  }, []);

  // Calculate total for a single row
  const calcRowTotal = useCallback((qty: number | string, unit: number | string) => {
    const parsedQty = parseFloat(qty as string) || 0;
    const parsedUnit = parseFloat(unit as string) || 0;
    return parsedQty * parsedUnit;
  }, []);

  // Recalculate the entire table's gross total
  const recalcTable = useCallback(() => {
    let grand = 0;
    const updatedTasks = tasks.map(task => {
      const total = calcRowTotal(task.qty, task.unit);
      grand += total;
      return { ...task, total: total };
    });
    setTasks(updatedTasks); // Update tasks with new totals
    if (grossValueRef.current) {
      grossValueRef.current.innerText = fmt(grand);
    }
  }, [tasks, fmt, calcRowTotal]);

  // Effect to recalculate table when tasks change
  useEffect(() => {
    recalcTable();
  }, [tasks, recalcTable]); // Dependency on tasks and recalcTable

  // Handle input changes for task table cells
  const handleTaskChange = (id: string, field: keyof InvoiceTask, value: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, [field]: value } : task
      )
    );
  };

  // Add a new row to the tasks table
  const addRow = () => {
    setTasks(prevTasks => [
      ...prevTasks,
      { id: `task-${Date.now()}`, qty: '', desc: '', unit: '', total: 0 }
    ]);
  };

  // Remove a row from the tasks table
  const removeRow = (id: string) => {
    if (tasks.length > 1) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  };

  // Invoice action handlers
  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    // Save invoice logic here
    console.log('Saving invoice...', { tasks, billTo, bankDetails });
    alert('Invoice saved successfully!');
  };

  const handlePreview = () => {
    // Preview logic here
    console.log('Previewing invoice...');
  };

  const handleExportPDF = () => {
    // PDF export logic here
    console.log('Exporting PDF...');
    alert('PDF export feature coming soon!');
  };

  const handleSendEmail = () => {
    // Email sending logic here
    console.log('Sending email...');
    alert('Email feature coming soon!');
  };

  const handleDuplicate = () => {
    // Duplicate invoice logic here
    console.log('Duplicating invoice...');
    alert('Invoice duplicated!');
  };

  // Template and customization handlers
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    console.log('Template changed to:', templateId);
  };

  const handleCustomize = () => {
    setShowCustomization(true);
  };

  const handleCustomizationClose = () => {
    setShowCustomization(false);
  };

  const handleCustomizationSave = (settings: any) => {
    setCustomizationSettings(settings);
    console.log('Customization settings saved:', settings);
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="flex-1 overflow-auto">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          
          <main className="p-6 space-y-6">
            {/* Modern Invoice Header */}
            <InvoiceHeader
              invoiceNumber={invoiceNumber}
              invoiceDate={invoiceDate}
              consultantName={consultantName}
              companyAddress={companyAddress}
            />

            {/* Invoice Actions Panel */}
            <InvoiceActions
              onPrint={handlePrint}
              onSave={handleSave}
              onPreview={handlePreview}
              onExportPDF={handleExportPDF}
              onSendEmail={handleSendEmail}
              onDuplicate={handleDuplicate}
            />

            {/* Invoice Templates */}
            <InvoiceTemplates
              selectedTemplate={selectedTemplate}
              onTemplateChange={handleTemplateChange}
              onCustomize={handleCustomize}
            />

            {/* Invoice Form Fields */}
            <InvoiceForm
              billTo={billTo}
              onBillToChange={setBillTo}
              bankDetails={bankDetails}
              onBankDetailsChange={setBankDetails}
            />

            {/* Enhanced Invoice Table */}
            <InvoiceTable
              tasks={tasks}
              onTaskChange={handleTaskChange}
              onAddRow={addRow}
              onRemoveRow={removeRow}
              formatNumber={fmt}
            />

            {/* Signature Section */}
            <InvoiceSignature
              signatureName={signatureName}
              onSignatureNameChange={setSignatureName}
            />

            {/* Customization Modal */}
            <InvoiceCustomization
              isOpen={showCustomization}
              onClose={handleCustomizationClose}
              settings={customizationSettings}
              onSettingsChange={handleCustomizationSave}
            />

            {/* Print Styles */}
            <style>{`
              @media print {
                .sidebar, .header, button { 
                  display: none !important;
                }
                body {
                  background: #fff;
                }
                main {
                  padding: 0 !important;
                  margin: 0 !important;
                }
              }
            `}</style>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Invoice;