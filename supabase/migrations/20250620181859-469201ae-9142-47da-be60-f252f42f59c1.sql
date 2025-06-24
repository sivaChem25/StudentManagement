
-- Create custom types/enums
CREATE TYPE public.app_role AS ENUM ('admin', 'super_admin', 'student');
CREATE TYPE public.payment_status AS ENUM ('pending', 'verified', 'rejected');

-- Create roles table
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name app_role NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mentors table (hardcoded profile)
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create webinars table
CREATE TABLE public.webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  csv_upload_url TEXT,
  channel_link TEXT,
  max_participants INTEGER DEFAULT 197,
  current_participants INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name TEXT NOT NULL,
  description TEXT,
  timetable TEXT NOT NULL,
  payment_amount DECIMAL(10,2) NOT NULL,
  webinar_id UUID REFERENCES public.webinars(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  telegram_no TEXT,
  nic_no TEXT UNIQUE,
  role app_role NOT NULL DEFAULT 'student',
  payment_status payment_status DEFAULT 'pending',
  webinar_id UUID REFERENCES public.webinars(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- Format: "YYYY-MM"
  amount DECIMAL(10,2) NOT NULL,
  payment_slip_url TEXT,
  status payment_status DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, class_id, month)
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(student_id, class_id)
);

-- Create predefined Q&A table
CREATE TABLE public.predefined_qna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default roles
INSERT INTO public.roles (role_name, description) VALUES 
  ('admin', 'Administrator with class and payment management privileges'),
  ('super_admin', 'Super administrator with full system access'),
  ('student', 'Student with enrollment and payment capabilities');

-- Insert hardcoded mentor profile
INSERT INTO public.mentors (name, bio) VALUES 
  ('Sivathiran Kangalingam', 'Expert educator and mentor');

-- Enable Row Level Security on all tables
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predefined_qna ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert their profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- RLS Policies for classes table
CREATE POLICY "Everyone can view active classes" ON public.classes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage classes" ON public.classes
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- RLS Policies for payments table
CREATE POLICY "Students can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own pending payments" ON public.payments
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update payment status" ON public.payments
  FOR UPDATE USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- RLS Policies for enrollments table
CREATE POLICY "Students can view their own enrollments" ON public.enrollments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can enroll themselves" ON public.enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins can view all enrollments" ON public.enrollments
  FOR SELECT USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

CREATE POLICY "Admins can manage enrollments" ON public.enrollments
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- RLS Policies for webinars table
CREATE POLICY "Everyone can view webinars" ON public.webinars
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage webinars" ON public.webinars
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- RLS Policies for predefined_qna table
CREATE POLICY "Everyone can view Q&A" ON public.predefined_qna
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage Q&A" ON public.predefined_qna
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'super_admin'));

-- RLS Policies for roles and mentors (read-only for authenticated users)
CREATE POLICY "Authenticated users can view roles" ON public.roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view mentors" ON public.mentors
  FOR SELECT TO authenticated USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_nic_no ON public.profiles(nic_no);
CREATE INDEX idx_profiles_telegram_no ON public.profiles(telegram_no);
CREATE INDEX idx_payments_user_month ON public.payments(user_id, month);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_enrollments_student_class ON public.enrollments(student_id, class_id);
CREATE INDEX idx_classes_active ON public.classes(is_active);
