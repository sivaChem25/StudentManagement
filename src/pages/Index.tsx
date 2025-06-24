
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import DashboardLayout from '../components/dashboard/DashboardLayout';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import SuperAdminDashboard from '../components/dashboard/SuperAdminDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { GraduationCap } from 'lucide-react';

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-blue-600 p-3 rounded-full mx-auto mb-4 w-fit">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center space-y-4">
          <div className="bg-blue-600 p-3 rounded-full mx-auto mb-4 w-fit">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Chemistry Class</h1>
          <p className="text-gray-600">Educational platform for admins and instructors</p>
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Login to Continue
          </Button>
        </div>
      </div>
    );
  }

  // Check if user role allows web access
  if (profile.role === 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="bg-blue-600 p-3 rounded-full mx-auto mb-4 w-fit">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Access Restricted</h1>
          <p className="text-gray-600">
            Students should use the mobile app to access classes and make payments.
          </p>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="mt-4"
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'super_admin':
        return <SuperAdminDashboard />;
      default:
        return <div>Invalid role for web access</div>;
    }
  };

  return (
    <DashboardLayout userRole={profile.role} onLogout={handleLogout}>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Index;
