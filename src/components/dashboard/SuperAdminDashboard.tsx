import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, BookOpen, DollarSign, TrendingUp, Plus, Shield, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SuperAdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [isClassListOpen, setIsClassListOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [editClass, setEditClass] = useState<any | null>(null);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);

  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);

  const [systemStats, setSystemStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalAdmins: 0,
    monthlyRevenue: 0,
    pendingPayments: 0
  });

  const handleAddAdmin = () => {
    const adminToAdd = {
      id: admins.length + 1,
      name: newAdmin.name,
      email: newAdmin.email,
      classesManaged: 0,
      studentsManaged: 0,
      joinDate: new Date().toISOString().split('T')[0]
    };
    
    setAdmins([...admins, adminToAdd]);
    setNewAdmin({ name: '', email: '', password: '' });
    setIsAddAdminOpen(false);
    console.log('New admin added:', adminToAdd);
    // TODO: Implement with Supabase Auth
  };

  const handleToggleAdminStatus = async (adminId: string, currentStatus: string) => {
    // Toggle payment_status only
    const newPaymentStatus = currentStatus === 'verified' ? 'pending' : 'verified';
    await supabase
      .from('profiles')
      .update({ payment_status: newPaymentStatus })
      .eq('id', adminId);
    // Update UI
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.id === adminId
          ? { ...admin, payment_status: newPaymentStatus }
          : admin
      )
    );
  };

  useEffect(() => {
    // Fetch all admins from Supabase
    const fetchAdmins = async () => {
      setLoadingAdmins(true);
      const { data: adminProfiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin');
      if (error) {
        setLoadingAdmins(false);
        return;
      }
      // For each admin, count classes managed and students managed
      const adminList = await Promise.all(
        (adminProfiles || []).map(async (admin: any) => {
          // Classes managed
          const { count: classesManaged } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', admin.id);
          // Students managed (sum of students in all classes managed)
          let studentsManaged = 0;
          if (classesManaged && classesManaged > 0) {
            const { data: classRows } = await supabase
              .from('classes')
              .select('id')
              .eq('created_by', admin.id);
            if (classRows) {
              for (const cls of classRows) {
                const { count: studentCount } = await supabase
                  .from('enrollments')
                  .select('*', { count: 'exact', head: true })
                  .eq('class_id', cls.id);
                studentsManaged += studentCount || 0;
              }
            }
          }
          return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            classesManaged: classesManaged || 0,
            studentsManaged,
            joinDate: admin.created_at ? admin.created_at.split('T')[0] : '',
            payment_status: admin.payment_status,
          };
        })
      );
      setAdmins(adminList);
      setLoadingAdmins(false);
    };
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (!isClassListOpen) return;
    const fetchClasses = async () => {
      setLoadingClasses(true);
      // Fetch all classes
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*');
      if (classError) {
        setLoadingClasses(false);
        return;
      }
      // Fetch teacher names and student counts for each class
      const classList = await Promise.all(
        (classData || []).map(async (cls: any) => {
          // Get teacher name
          let teacherName = 'Unknown';
          if (cls.created_by) {
            const { data: teacherProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', cls.created_by)
              .single();
            teacherName = teacherProfile?.name || 'Unknown';
          }
          // Get student count
          const { count: studentCount } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);
          return {
            id: cls.id,
            name: cls.class_name,
            teacher: teacherName,
            students: studentCount || 0,
          };
        })
      );
      setClasses(classList);
      setLoadingClasses(false);
    };
    fetchClasses();
  }, [isClassListOpen]);

  // Fetch all classes for grid view (not just modal)
  useEffect(() => {
    const fetchAllClasses = async () => {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*');
      if (classError) return;
      const classList = await Promise.all(
        (classData || []).map(async (cls: any) => {
          let teacherName = 'Unknown';
          if (cls.created_by) {
            const { data: teacherProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', cls.created_by)
              .single();
            teacherName = teacherProfile?.name || 'Unknown';
          }
          const { count: studentCount } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);
          return {
            id: cls.id,
            name: cls.class_name,
            teacher: teacherName,
            students: studentCount || 0,
            schedule: cls.timetable,
            fee: cls.payment_amount,
          };
        })
      );
      setClasses(classList);
    };
    fetchAllClasses();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      // Total Classes
      const { count: totalClasses } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });
      // Total Students
      const { count: totalStudents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');
      // Active Admins
      const { count: totalAdmins } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin')
        .eq('payment_status', 'verified');
      // Monthly Revenue (sum of payment_amount for all classes)
      const { data: classData } = await supabase
        .from('classes')
        .select('payment_amount');
      const monthlyRevenue = (classData || []).reduce((sum, c) => sum + (c.payment_amount || 0), 0);
      // Pending Payments
      const { count: pendingPayments } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setSystemStats({
        totalClasses: totalClasses || 0,
        totalStudents: totalStudents || 0,
        totalAdmins: totalAdmins || 0,
        monthlyRevenue: monthlyRevenue || 0,
        pendingPayments: pendingPayments || 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-purple-100">Complete system overview and admin management</p>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Total Classes card always visible */}
        <Card onClick={() => setIsClassListOpen(true)} className="cursor-pointer hover:shadow-lg transition">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Only show to super admin */}
        {profile?.role === 'super_admin' && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStats.totalStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">LKR {systemStats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Admins</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalAdmins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Revenue Analytics</span>
          </CardTitle>
          <CardDescription>Monthly revenue trend and projections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Revenue Chart</p>
              <p className="text-sm">Chart component will be integrated here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Management */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
          <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>
                  Create a new admin account with class management privileges.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-name">Full Name</Label>
                  <Input
                    id="admin-name"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                    placeholder="Enter admin's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    placeholder="Enter admin's email"
                  />
                </div>
                <div>
                  <Label htmlFor="admin-password">Temporary Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    placeholder="Enter temporary password"
                  />
                </div>
                <Button onClick={handleAddAdmin} className="w-full">
                  Create Admin Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardContent className="p-0">
            {loadingAdmins ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classes Managed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Students Managed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Join Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => {
                      const isActive = admin.payment_status === 'verified';
                      return (
                        <tr key={admin.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {admin.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {admin.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {admin.classesManaged}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {admin.studentsManaged}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {admin.joinDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}>
                              {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="ml-2"
                              onClick={() => handleToggleAdminStatus(admin.id, admin.payment_status)}
                            >
                              Set {isActive ? 'Inactive' : 'Active'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Classes Management (like Admin Dashboard) */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Classes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="mb-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{cls.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditClass(cls);
                    setIsEditClassOpen(true);
                  }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteClassId(cls.id)}>
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Schedule:</strong> {cls.schedule || '-'}</p>
                  <p><strong>Instructor:</strong> {cls.teacher}</p>
                  <p><strong>Fee:</strong> LKR {cls.fee}/month</p>
                  <p><strong>Enrolled Students:</strong> {cls.students}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Class Dialog */}
      <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                value={editClass?.name || ''}
                onChange={(e) => setEditClass({ ...editClass, name: e.target.value })}
                placeholder="Enter class name"
              />
            </div>
            <div>
              <Label htmlFor="class-schedule">Schedule</Label>
              <Input
                id="class-schedule"
                value={editClass?.schedule || ''}
                onChange={(e) => setEditClass({ ...editClass, schedule: e.target.value })}
                placeholder="Enter class schedule"
              />
            </div>
            <div>
              <Label htmlFor="class-fee">Fee (LKR)</Label>
              <Input
                id="class-fee"
                type="number"
                value={editClass?.fee || ''}
                onChange={(e) => setEditClass({ ...editClass, fee: e.target.value })}
                placeholder="Enter class fee"
              />
            </div>
            <Button
              className="mt-4 w-full"
              onClick={async () => {
                if (!editClass) return;
                await supabase.from('classes').update({
                  class_name: editClass.name,
                  timetable: editClass.schedule,
                  payment_amount: parseFloat(editClass.fee)
                }).eq('id', editClass.id);
                setClasses((prev) => prev.map((c) => c.id === editClass.id ? { ...c, name: editClass.name, schedule: editClass.schedule, fee: editClass.fee } : c));
                setIsEditClassOpen(false);
                setEditClass(null);
              }}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteClassId} onOpenChange={open => { if (!open) setDeleteClassId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>Are you sure you want to delete this class? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteClassId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              if (deleteClassId) {
                await supabase.from('classes').delete().eq('id', deleteClassId);
                setClasses((prev) => prev.filter((c) => c.id !== deleteClassId));
                setDeleteClassId(null);
              }
            }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminDashboard;
