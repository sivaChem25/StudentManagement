
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, GraduationCap, Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: string;
  onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userRole, onLogout }) => {
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'student': return 'Student';
      default: return 'User';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chemistry Class</h1>
                <p className="text-sm text-gray-500">Student Management System</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
                {getRoleDisplay(userRole)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
