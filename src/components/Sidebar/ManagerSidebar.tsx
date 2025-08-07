import React from 'react';
import { Clock, BarChart3, Calendar, Users, FileText, Settings, X, Plus, ClipboardList } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
    { icon: Clock, label: 'Timesheets', href: '/timesheets' },
    { icon: FileText, label: 'Projects', href: '/projects' },
    { icon: Users, label: 'Team', href: '/team' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: ClipboardList, label: 'Leave Application', href: '/leave-application' },
    { icon: ClipboardList, label: 'Invoice', href: '/invoice' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-900 to-indigo-800 text-white transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-indigo-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-indigo-200" />
            </div>
            <h1 className="text-xl font-bold">TimeTracker</h1>
          </div>
          <button onClick={onClose} className="lg:hidden text-indigo-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          {/* User Profile */}
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
              <span className="text-lg font-semibold">JD</span>
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-xs text-indigo-300">Admin</p>
            </div>
          </div>
          
          {/* Quick Start Button */}
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg flex items-center justify-center mb-6 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Start Timer
          </button>
          
          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                  location.pathname === item.href
                    ? "bg-indigo-700 text-white" 
                    : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};
