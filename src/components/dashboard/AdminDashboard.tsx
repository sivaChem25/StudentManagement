import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, BookOpen, DollarSign, Eye, Check, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarHeader,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

const AdminDashboard: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  // Fetch payment data joined only with the profile table (no class join) for admin dashboard.
  const [paymentSlips, setPaymentSlips] = useState<any[]>([]);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    title: '',
    description: '',
    schedule: '',
    fee: '',
    instructor: ''
  });

  const [editClass, setEditClass] = useState<any | null>(null);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);

  const [questionsAndAnswers, setQuestionsAndAnswers] = useState<{ id: string; question: string; answer: string }[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // FAQ state
  const [faqCategories, setFaqCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [faqQuestions, setFaqQuestions] = useState<{ id: string; question: string; answer: string }[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");

  // Fetch all FAQ questions (not just for selected category)
  const [allFaqQuestions, setAllFaqQuestions] = useState<any[]>([]);
  useEffect(() => {
    const fetchAllQuestions = async () => {
      const { data, error } = await supabase
        .from('faq_questions')
        .select('id, question, answer, category_id, is_active, created_at');
      if (!error && data) setAllFaqQuestions(data);
    };
    fetchAllQuestions();
  }, [faqQuestions]); // refetch when questions change

  const [activeSection, setActiveSection] = useState<'classes' | 'payments' | 'faq' | 'qna'>('classes');

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase.from('classes').select('*');
      if (!error && data) {
        setClasses(data.map(cls => ({
          id: cls.id,
          title: cls.class_name,
          description: cls.description,
          schedule: cls.timetable,
          fee: cls.payment_amount,
          enrolledStudents: 0, // Optionally fetch actual count if needed
          instructor: '', // Optionally fetch instructor if available
          is_active: cls.is_active
        })));
      }
    };
    fetchClasses();
  }, []);

  // Fetch Q&A for selected class
  useEffect(() => {
    if (!selectedClassId) {
      setQuestionsAndAnswers([]);
      return;
    }
    const fetchQnA = async () => {
      const { data, error } = await supabase
        .from('predefined_qna')
        .select('*')
        .eq('class_id', selectedClassId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setQuestionsAndAnswers(data.map(q => ({ id: q.id, question: q.question, answer: q.answer })));
      }
    };
    fetchQnA();
  }, [selectedClassId]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('faq_categories').select('id, name');
      if (!error && data) setFaqCategories(data);
    };
    fetchCategories();
  }, []);

  // Fetch questions for selected category
  useEffect(() => {
    if (!selectedCategoryId) { setFaqQuestions([]); return; }
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('faq_questions')
        .select('id, question, answer')
        .eq('category_id', selectedCategoryId)
        .order('created_at', { ascending: false });
      if (!error && data) setFaqQuestions(data);
    };
    fetchQuestions();
  }, [selectedCategoryId]);

  // Fetch all classes for class ID to name mapping
  const [classMap, setClassMap] = useState<{ [id: string]: string }>({});
  useEffect(() => {
    const fetchClassMap = async () => {
      const { data, error } = await supabase.from('classes').select('id, class_name');
      if (!error && data) {
        const map: { [id: string]: string } = {};
        data.forEach((cls: any) => { map[cls.id] = cls.class_name; });
        setClassMap(map);
      }
    };
    fetchClassMap();
  }, []);

  // Fetch payment slips from Supabase with student info (profile join only)
  useEffect(() => {
    const fetchPaymentSlips = async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          created_at,
          status,
          payment_slip_url,
          class_ids,
          profiles:user_id (name, email)
        `)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setPaymentSlips(
          data.map((p: any) => {
            let classNames: string[] = [];
            try {
              const ids = Array.isArray(p.class_ids) ? p.class_ids : JSON.parse(p.class_ids || '[]');
              classNames = ids.map((id: string) => classMap[id] || id);
            } catch { classNames = []; }
            return {
              id: p.id,
              studentName: p.profiles?.name || '-',
              studentEmail: p.profiles?.email || '-',
              amount: p.amount,
              uploadDate: p.created_at?.split('T')[0] || '',
              status: p.status,
              payment_slip_url: p.payment_slip_url,
              classNames
            };
          })
        );
      }
    };
    fetchPaymentSlips();
  }, [classMap]);

  const handleAddClass = async () => {
    // Prepare the class data for Supabase
    const classToAdd = {
      class_name: newClass.title,
      description: newClass.description,
      timetable: newClass.schedule,
      payment_amount: parseFloat(newClass.fee),
      // Optionally, set webinar_id and created_by if available
    };

    const { data, error } = await supabase.from('classes').insert([classToAdd]).select();
    if (error) {
      alert('Failed to add class: ' + error.message);
      return;
    }
    if (data && data.length > 0) {
      setClasses([...classes, {
        id: data[0].id,
        title: data[0].class_name,
        description: data[0].description,
        schedule: data[0].timetable,
        fee: data[0].payment_amount,
        enrolledStudents: 0,
        instructor: newClass.instructor
      }]);
    }
    setNewClass({ title: '', description: '', schedule: '', fee: '', instructor: '' });
    setIsAddClassOpen(false);
    console.log('New class added:', classToAdd);
    // TODO: Implement with Supabase
  };

  const handleVerifyPayment = (paymentId: number) => {
    console.log(`Verifying payment ${paymentId}`);
    // TODO: Implement payment verification with Supabase
  };

  const handleEditClass = (cls: any) => {
    setEditClass({ ...cls });
    setIsEditClassOpen(true);
  };

  const handleUpdateClass = async () => {
    if (!editClass) return;
    const { id, title, description, schedule, fee } = editClass;
    const { error } = await supabase.from('classes').update({
      class_name: title,
      description,
      timetable: schedule,
      payment_amount: parseFloat(fee)
    }).eq('id', id);
    if (error) {
      alert('Failed to update class: ' + error.message);
      return;
    }
    setClasses(classes.map(cls => cls.id === id ? { ...cls, title, description, schedule, fee: parseFloat(fee) } : cls));
    setIsEditClassOpen(false);
    setEditClass(null);
  };

  // Add new Q&A to Supabase
  const handleAddQnA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !newQuestion.trim() || !newAnswer.trim()) return;
    const { data, error } = await supabase
      .from('predefined_qna')
      .insert([{ class_id: selectedClassId, question: newQuestion, answer: newAnswer }])
      .select();
    if (!error && data && data.length > 0) {
      setQuestionsAndAnswers([{ id: data[0].id, question: data[0].question, answer: data[0].answer }, ...questionsAndAnswers]);
      setNewQuestion("");
      setNewAnswer("");
    }
  };

  // Add new FAQ
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    const { data, error } = await supabase
      .from('faq_questions')
      .insert([{ category_id: selectedCategoryId, question: newFaqQuestion, answer: newFaqAnswer }])
      .select();
    if (!error && data && data.length > 0) {
      setFaqQuestions([{ id: data[0].id, question: data[0].question, answer: data[0].answer }, ...faqQuestions]);
      setNewFaqQuestion("");
      setNewFaqAnswer("");
    }
  };

  // Edit FAQ state
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState("");
  const [editingAnswer, setEditingAnswer] = useState("");

  // Save FAQ edit
  const handleSaveFaqEdit = async (id: string) => {
    const { error } = await supabase
      .from('faq_questions')
      .update({ question: editingQuestion, answer: editingAnswer })
      .eq('id', id);
    if (!error) {
      setAllFaqQuestions(allFaqQuestions.map(q => q.id === id ? { ...q, question: editingQuestion, answer: editingAnswer } : q));
      setEditingFaqId(null);
    }
  };

  const totalRevenue = classes.reduce((sum, cls) => sum + (cls.fee * cls.enrolledStudents), 0);
  const totalStudents = classes.reduce((sum, cls) => sum + cls.enrolledStudents, 0);

  // Sidebar menu config
  const sidebarMenu = [
    { key: 'classes', label: 'Classes' },
    { key: 'payments', label: 'Payments' },
    { key: 'faq', label: 'FAQ Management' },
    { key: 'qna', label: 'Q&A Management' },
  ];

  // Payment status change handler (Supabase version)
  const handleChangePaymentStatus = async (paymentId: string, status: 'pending' | 'verified' | 'rejected') => {
    const { error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId);
    if (!error) {
      setPaymentSlips((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, status } : p
        )
      );
    } else {
      alert('Failed to update payment status: ' + error.message);
    }
  };

  // State for slip popup
  const [slipDialogOpen, setSlipDialogOpen] = useState(false);
  const [slipDialogUrl, setSlipDialogUrl] = useState<string | null>(null);

  // Search state for payment table
  const [paymentSearch, setPaymentSearch] = useState("");

  // Filtered payment slips by student name or email
  const filteredPaymentSlips = paymentSlips.filter((p) => {
    const search = paymentSearch.toLowerCase();
    return (
      (p.studentName && p.studentName.toLowerCase().includes(search)) ||
      (p.studentEmail && p.studentEmail.toLowerCase().includes(search))
    );
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-30">
        <Sidebar className="bg-white border-r shadow-sm min-h-screen w-64">
          <SidebarHeader>
            <SidebarGroupLabel className="text-lg font-bold text-blue-700 mb-2">Admin</SidebarGroupLabel>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {sidebarMenu.map(item => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={activeSection === item.key}
                    onClick={() => setActiveSection(item.key as typeof activeSection)}
                    className="text-base py-3 px-4 rounded hover:bg-blue-50 focus:bg-blue-100"
                  >
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 bg-gray-50 min-h-screen">
          <div className="w-full max-w-6xl mx-auto">
            {activeSection === 'classes' && (
              <>
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white mb-8 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                  <p className="text-green-100">Manage your classes and track student progress</p>
                </div>
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Classes</p>
                          <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Students</p>
                          <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-3 rounded-lg">
                          <DollarSign className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Monthly Revenue</p>
                          <p className="text-2xl font-bold text-gray-900">${totalRevenue}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card> */}

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <Eye className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Pending Payments</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {paymentSlips.filter(p => p.status === 'pending').length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {/* Classes Management */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Classes</h2>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                  <div></div>
                  <Button onClick={() => setIsAddClassOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Class
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {classes.map((cls) => (
                    <Card key={cls.id} className="mb-4">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xl font-bold">{cls.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditClass(cls)}>
                            Edit
                          </Button>
                          <Badge className={cls.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}>
                            {cls.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            variant={cls.is_active ? 'destructive' : 'default'}
                            onClick={async () => {
                              await supabase.from('classes').update({ is_active: !cls.is_active }).eq('id', cls.id);
                              setClasses((prev) => prev.map((c) => c.id === cls.id ? { ...c, is_active: !c.is_active } : c));
                            }}
                          >
                            Set {cls.is_active ? 'Inactive' : 'Active'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Schedule:</strong> {cls.schedule}</p>
                          <p><strong>Instructor:</strong> {cls.instructor}</p>
                          <p><strong>Fee:</strong> LKR {cls.fee}/month</p>
                          <p><strong>Enrolled Students:</strong> {cls.enrolledStudents}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Class</DialogTitle>
                    </DialogHeader>
                    <Label>Title</Label>
                    <Input value={editClass?.title || ''} onChange={e => setEditClass({ ...editClass, title: e.target.value })} />
                    <Label>Description</Label>
                    <Textarea value={editClass?.description || ''} onChange={e => setEditClass({ ...editClass, description: e.target.value })} />
                    <Label>Schedule</Label>
                    <Input value={editClass?.schedule || ''} onChange={e => setEditClass({ ...editClass, schedule: e.target.value })} />
                    <Label>Fee</Label>
                    <Input type="number" value={editClass?.fee || ''} onChange={e => setEditClass({ ...editClass, fee: e.target.value })} />
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setIsEditClassOpen(false)}>Cancel</Button>
                      <Button onClick={handleUpdateClass}>Update</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
            {activeSection === 'payments' && (
              <div className="bg-white rounded-xl shadow p-6 md:p-10 w-full">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">Payment Verification</h2>
                <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-end gap-3">
                  <input
                    type="text"
                    className="border rounded px-4 py-2 w-full md:w-80 focus:ring-2 focus:ring-blue-400"
                    placeholder="Search by student name or email..."
                    value={paymentSearch}
                    onChange={e => setPaymentSearch(e.target.value)}
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded-lg text-sm md:text-base">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Classes</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Upload Date</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Slip</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPaymentSlips.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 align-middle">{payment.studentName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 align-middle">{payment.studentEmail}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 align-middle">{payment.classNames && payment.classNames.length > 0 ? payment.classNames.join(', ') : '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right align-middle">{payment.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center align-middle">{payment.uploadDate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline text-center align-middle">
                            {payment.payment_slip_url ? (
                              <button
                                className="underline text-blue-600 hover:text-blue-800"
                                onClick={() => { setSlipDialogUrl(payment.payment_slip_url); setSlipDialogOpen(true); }}
                              >
                                View Slip
                              </button>
                            ) : (
                              <span className="text-gray-400">No Slip</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center align-middle">
                            <span className={
                              payment.status === 'verified'
                                ? 'bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold'
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold'
                                : 'bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold'
                            }>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center align-middle">
                            <div className="flex flex-row items-center justify-center space-x-2">
                              <button
                                className={`bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${payment.status === 'verified' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => handleChangePaymentStatus(payment.id, 'verified')}
                                disabled={payment.status === 'verified' || !payment.payment_slip_url}
                                title={payment.payment_slip_url ? 'Mark as Verified' : 'Cannot verify without slip'}
                              >
                                &#10003;
                              </button>
                              <button
                                className={`bg-yellow-500 hover:bg-yellow-600 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${payment.status === 'pending' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => handleChangePaymentStatus(payment.id, 'pending')}
                                disabled={payment.status === 'pending'}
                                title="Mark as Pending"
                              >
                                P
                              </button>
                              <button
                                className={`border border-red-500 text-red-500 rounded px-4 py-2 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 ${payment.status === 'rejected' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => handleChangePaymentStatus(payment.id, 'rejected')}
                                disabled={payment.status === 'rejected'}
                                title="Reject Payment"
                              >
                                &#10005;
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Slip Dialog Popup */}
                {slipDialogOpen && slipDialogUrl && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-4 w-[400px] h-[400px] flex flex-col items-center justify-center relative">
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                        onClick={() => setSlipDialogOpen(false)}
                      >
                        &times;
                      </button>
                      <img src={slipDialogUrl} alt="Payment Slip" className="max-w-full max-h-full object-contain rounded" />
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeSection === 'faq' && (
              <div className="bg-white rounded-xl shadow p-6 md:p-8 w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center md:text-left">FAQ Management</h2>
            <form onSubmit={handleAddFaq} className="flex flex-col gap-3 md:gap-4 max-w-xl mx-auto mb-8">
              <Label htmlFor="faq-category" className="font-semibold">Category</Label>
              <select
                id="faq-category"
                value={selectedCategoryId}
                onChange={e => setSelectedCategoryId(e.target.value)}
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
                required
              >
                <option value="">Select a category</option>
                {faqCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <Label htmlFor="faq-question" className="font-semibold">Question</Label>
              <Input
                id="faq-question"
                value={newFaqQuestion}
                onChange={e => setNewFaqQuestion(e.target.value)}
                placeholder="Enter question"
                className="rounded px-3 py-2 border focus:ring-2 focus:ring-blue-400"
                required
              />
              <Label htmlFor="faq-answer" className="font-semibold">Answer</Label>
              <Textarea
                id="faq-answer"
                value={newFaqAnswer}
                onChange={e => setNewFaqAnswer(e.target.value)}
                placeholder="Enter answer"
                className="rounded px-3 py-2 border focus:ring-2 focus:ring-blue-400 min-h-[80px]"
                required
              />
              <Button type="submit" className="mt-2 w-full md:w-fit bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded shadow">Add FAQ</Button>
            </form>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg text-sm md:text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Category</th>
                    <th className="px-4 py-2 border">Question</th>
                    <th className="px-4 py-2 border">Answer</th>
                    <th className="px-4 py-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allFaqQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{faqCategories.find(c => c.id === q.category_id)?.name || '-'}</td>
                      <td className="px-4 py-2 border">
                        {editingFaqId === q.id ? (
                          <Input value={editingQuestion} onChange={e => setEditingQuestion(e.target.value)} className="rounded px-2 py-1 border" />
                        ) : (
                          <span className="font-medium">{q.question}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border">
                        {editingFaqId === q.id ? (
                          <Textarea value={editingAnswer} onChange={e => setEditingAnswer(e.target.value)} className="rounded px-2 py-1 border min-h-[40px]" />
                        ) : (
                          <span>{q.answer}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {editingFaqId === q.id ? (
                          <>
                            <Button size="sm" className="mr-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleSaveFaqEdit(q.id)}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingFaqId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => { setEditingFaqId(q.id); setEditingQuestion(q.question); setEditingAnswer(q.answer); }}>Edit</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            )}
            {activeSection === 'qna' && (
              <div>
                {/* Predefined Questions & Answers Management */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Predefined Questions & Answers</h2>
                  <div className="mb-4">
                    <form onSubmit={handleAddQnA} className="flex flex-col gap-2 max-w-lg">
                      <Label htmlFor="class">Class</Label>
                      <select
                        id="class"
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                        className="border rounded px-2 py-1"
                        required
                      >
                        <option value="">Select a class</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.title}</option>
                        ))}
                      </select>
                      <Label htmlFor="question">Question</Label>
                      <Input
                        id="question"
                        value={newQuestion}
                        onChange={e => setNewQuestion(e.target.value)}
                        placeholder="Enter question"
                        required
                      />
                      <Label htmlFor="answer">Answer</Label>
                      <Textarea
                        id="answer"
                        value={newAnswer}
                        onChange={e => setNewAnswer(e.target.value)}
                        placeholder="Enter answer"
                        required
                      />
                      <Button type="submit" className="mt-2 w-fit" disabled={!selectedClassId}>Add Q&A</Button>
                    </form>
                  </div>
                  <div>
                    {questionsAndAnswers.length === 0 ? (
                      <p className="text-gray-500">No questions added yet for this class.</p>
                    ) : (
                      <ul className="space-y-4">
                        {questionsAndAnswers.map((qa) => (
                          <li key={qa.id} className="border rounded-lg p-4 bg-gray-50">
                            <p className="font-semibold">Q: {qa.question}</p>
                            <p className="text-gray-700">A: {qa.answer}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
