
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, DollarSign, Upload, Check, AlertCircle } from 'lucide-react';

const StudentDashboard: React.FC = () => {
  const [enrolledClasses] = useState([
    {
      id: 1,
      title: "Advanced Mathematics",
      description: "Calculus and Linear Algebra",
      schedule: "Mon, Wed, Fri - 10:00 AM",
      fee: 150,
      paymentStatus: "verified",
      instructor: "Dr. Smith"
    },
    {
      id: 2,
      title: "Physics Laboratory",
      description: "Hands-on physics experiments",
      schedule: "Tue, Thu - 2:00 PM",
      fee: 200,
      paymentStatus: "pending",
      instructor: "Prof. Johnson"
    }
  ]);

  const [availableClasses] = useState([
    {
      id: 3,
      title: "Computer Science Fundamentals",
      description: "Introduction to programming and algorithms",
      schedule: "Mon, Wed - 3:00 PM",
      fee: 180,
      instructor: "Dr. Wilson"
    },
    {
      id: 4,
      title: "Chemistry Lab",
      description: "Organic and inorganic chemistry experiments",
      schedule: "Fri - 1:00 PM",
      fee: 160,
      instructor: "Prof. Davis"
    }
  ]);

  const handleEnroll = (classId: number) => {
    console.log(`Enrolling in class ${classId}`);
    // TODO: Implement enrollment logic with Supabase
  };

  const handleUploadSlip = (classId: number) => {
    console.log(`Uploading payment slip for class ${classId}`);
    // TODO: Implement file upload logic with Supabase Storage
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Student!</h1>
        <p className="text-blue-100">Manage your classes and track your learning progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Enrolled Classes</p>
                <p className="text-2xl font-bold text-gray-900">{enrolledClasses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Fees</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${enrolledClasses.reduce((sum, cls) => sum + cls.fee, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Classes</p>
                <p className="text-2xl font-bold text-gray-900">{availableClasses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Classes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Classes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {enrolledClasses.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{cls.title}</CardTitle>
                    <CardDescription>{cls.description}</CardDescription>
                  </div>
                  {getPaymentStatusBadge(cls.paymentStatus)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {cls.schedule}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${cls.fee}/month
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {cls.instructor}
                  </div>
                  {cls.paymentStatus === 'pending' && (
                    <Button
                      onClick={() => handleUploadSlip(cls.id)}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Payment Slip
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Available Classes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Classes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {availableClasses.map((cls) => (
            <Card key={cls.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{cls.title}</CardTitle>
                <CardDescription>{cls.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {cls.schedule}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${cls.fee}/month
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {cls.instructor}
                  </div>
                  <Button
                    onClick={() => handleEnroll(cls.id)}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  >
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
