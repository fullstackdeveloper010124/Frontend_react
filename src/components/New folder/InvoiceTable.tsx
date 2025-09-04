import React, { useState } from 'react';
import { Plus, Trash2, Calculator, DollarSign } from 'lucide-react';

interface InvoiceTask {
  id: string;
  qty: number | string;
  desc: string;
  unit: number | string;
  total: number;
}

interface InvoiceTableProps {
  tasks: InvoiceTask[];
  onTaskChange: (id: string, field: keyof InvoiceTask, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  formatNumber: (n: number | string) => string;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  tasks,
  onTaskChange,
  onAddRow,
  onRemoveRow,
  formatNumber
}) => {
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const grossTotal = tasks.reduce((sum, task) => sum + (task.total || 0), 0);

  const handleCellEdit = (taskId: string, field: keyof InvoiceTask, value: string) => {
    onTaskChange(taskId, field, value);
    setEditingCell(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Items</h3>
          </div>
          <button
            onClick={onAddRow}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                Qty/Hours
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                Rate/Unit
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                Total
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task, index) => (
              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={task.qty}
                    onChange={(e) => onTaskChange(task.id, 'qty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </td>
                <td className="px-6 py-4">
                  <textarea
                    value={task.desc}
                    onChange={(e) => onTaskChange(task.id, 'desc', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter description..."
                    rows={2}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={task.unit}
                      onChange={(e) => onTaskChange(task.id, 'unit', e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    ${formatNumber(task.total)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => onRemoveRow(task.id)}
                    disabled={tasks.length === 1}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subtotal:</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">${formatNumber(grossTotal)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tax (0%):</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">$0.00</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-blue-50 dark:bg-blue-500/20 rounded-lg px-3 mt-2">
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">Total:</span>
              <span className="text-xl font-bold text-blue-900 dark:text-blue-100">${formatNumber(grossTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
