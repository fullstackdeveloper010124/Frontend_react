import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from "../components/Sidebar"; // Assuming path is correct
import { Header } from "../components/Header"; // Assuming path is correct

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
  const [invoiceNumber] = useState('202506');
  const [invoiceDate] = useState(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
  const [consultantName] = useState('Consultant Name / Company');
  const [companyAddress] = useState('Address line 1, City, Country');

  // State for editable content
  const [billTo, setBillTo] = useState('');
  const [bankDetails, setBankDetails] = useState(
    '<p>Bank Name:</p><p>Full Address of Bank:</p><p>Account Holder:</p><p>Account Holder Address:</p><p>Account No:</p><p>Saving Account</p>'
  );

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
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  // Handle contenteditable div changes
  const handleContentEditableChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.FormEvent<HTMLDivElement>) => {
      setter(e.currentTarget.innerHTML);
    };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar Component */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="w-full">
        {/* Header Component */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="p-6">
          {/* Inline styles for the invoice component are placed here */}
          <style>{`
            :root {
              --border: 1px solid #000;
              --accent: #ffcc00;
              --light-bg: #fff9e6;
            }
            * {
              box-sizing: border-box;
              font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            }
            /* Note: body styles are overridden by the main app layout's flex container */
            .invoice {
              width: 850px;
              margin: 20px auto; /* Added vertical margin for spacing */
              background: #fff;
              padding: 40px 50px;
              border: var(--border);
              box-shadow: 0 4px 6px rgba(0,0,0,0.1); /* Added a subtle shadow */
            }
            .invoice header {
              text-align: center;
              margin-bottom: 30px;
            }
            .invoice header h1 {
              margin: 0 0 10px;
              text-decoration: underline;
            }
            .company-info,
            .client-info,
            .bank-details {
              border: var(--border);
              padding: 10px;
              background: var(--light-bg);
            }
            .company-info {
              width: 60%;
              margin: 0 auto 20px;
            }
            .meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
              font-size: 0.95rem;
            }
            .meta div {
              width: 48%;
            }
            .section-title {
              font-weight: 600;
              margin-bottom: 6px;
              text-decoration: underline;
            }
            .tasks-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
            }
            .tasks-table th,
            .tasks-table td {
              border: var(--border);
              padding: 8px 6px;
              text-align: left;
            }
            .tasks-table th {
              background: var(--light-bg);
              text-align: center;
            }
            .tasks-table td.unit,
            .tasks-table td.total,
            .tasks-table th.unit,
            .tasks-table th.total {
              text-align: center;
              width: 90px;
            }
            #gross-total {
              text-align: right;
              font-weight: 600;
              margin-bottom: 30px;
            }
            .bank-details p {
              margin: 4px 0;
              font-size: 0.95rem;
            }
            .signature {
              display: flex;
              justify-content: flex-start;
              margin-top: 40px;
            }
            .signature-box {
              border: var(--border);
              width: 220px;
              height: 60px;
              background: var(--accent);
            }
            .signature-label {
              margin-top: 6px;
              font-weight: 600;
            }
            .print-button-container { /* New container for centering the print button */
                text-align: center;
                width: 850px;
                margin: 20px auto;
            }
            .print-btn {
              display: inline-block; /* Changed to inline-block for centering with text-align */
              padding: 10px 20px;
              border: none;
              background: #000;
              color: #fff;
              cursor: pointer;
            }
            @media print {
              .print-btn, .print-button-container, .sidebar, .header { /* Hide sidebar and header on print */
                display: none !important; /* Use !important to override potential component styles */
              }
              body {
                background: #fff;
              }
              .invoice {
                border: none;
                width: 100%;
                padding: 0;
                margin: 0; /* Remove margin for print */
                box-shadow: none; /* Remove shadow for print */
              }
            }
          `}</style>

          <section className="invoice" id="invoice">
            <header>
              <h1>INVOICE</h1>
              <div className="company-info">
                <strong id="consultant-name">{consultantName}</strong><br />
                <span id="company-address">{companyAddress}</span>
              </div>
            </header>

            <div className="meta">
              <div>
                <span className="section-title">Invoice Number:</span>
                <span id="invoice-number">{invoiceNumber}</span>
              </div>
              <div>
                <span className="section-title">Date:</span>
                <span id="invoice-date">{invoiceDate}</span>
              </div>
            </div>

            <div className="section-title">To:</div>
            <div
              className="client-info"
              contentEditable="true"
              id="bill-to"
              style={{ height: '80px' }}
              onInput={handleContentEditableChange(setBillTo)}
              dangerouslySetInnerHTML={{ __html: billTo }}
            ></div>

            <table className="tasks-table" id="tasks-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Days / Hrs</th>
                  <th>Description (Project Name / Task Summary)</th>
                  <th className="unit">Unit</th>
                  <th className="total">Total</th>
                  <th style={{ width: '40px' }}>
                    <button title="Add Row" onClick={addRow}>+</button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td
                      contentEditable="true"
                      className="qty"
                      onInput={(e) => handleTaskChange(task.id, 'qty', e.currentTarget.innerText)}
                      suppressContentEditableWarning={true}
                    >
                      {task.qty}
                    </td>
                    <td
                      contentEditable="true"
                      className="desc"
                      onInput={(e) => handleTaskChange(task.id, 'desc', e.currentTarget.innerText)}
                      suppressContentEditableWarning={true}
                    >
                      {task.desc}
                    </td>
                    <td
                      contentEditable="true"
                      className="unit"
                      onInput={(e) => handleTaskChange(task.id, 'unit', e.currentTarget.innerText)}
                      suppressContentEditableWarning={true}
                    >
                      {task.unit}
                    </td>
                    <td className="total">{fmt(task.total)}</td>
                    <td>
                      <button onClick={() => removeRow(task.id)}>x</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div id="gross-total">Gross Total &gt;&gt;&gt; <span id="gross-value" ref={grossValueRef}>0.00</span></div>

            <div className="section-title">Bank Details:</div>
            <div
              className="bank-details"
              contentEditable="true"
              id="bank-details"
              onInput={handleContentEditableChange(setBankDetails)}
              dangerouslySetInnerHTML={{ __html: bankDetails }}
            ></div>

            <div className="signature">
              <div>
                <div className="signature-box"></div>
                <div className="signature-label" contentEditable="true">Person Name</div>
              </div>
            </div>
          </section>

          {/* Container for centering the print button */}
          <div className="print-button-container">
            <button className="print-btn" onClick={() => window.print()}>Print Invoice</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Invoice;