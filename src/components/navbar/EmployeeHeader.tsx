
import React, { useState } from 'react';
import { Menu, Search, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(3);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    navigate('/login');
  };

  const handleNotifications = () => {
    console.log('Notifications clicked');
    toast({
      title: "Notifications",
      description: "You have 3 new notifications."
    });
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Timesheet Dashboard
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          
          {/* Notifications */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[0.75rem] h-3 px-[2px] text-[10px] leading-3 bg-red-500 text-white rounded-full flex items-center justify-center">{unreadCount}</span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={() => setUnreadCount(Math.max(0, unreadCount - 1))}>
                  New comment on Project Alpha
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUnreadCount(Math.max(0, unreadCount - 1))}>
                  Timesheet approved
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setUnreadCount(Math.max(0, unreadCount - 1))}>
                  Task deadline tomorrow
                </DropdownMenuItem>
                <div className="px-2 py-1">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setUnreadCount(0)}>
                    Mark all as read
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Logout Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
