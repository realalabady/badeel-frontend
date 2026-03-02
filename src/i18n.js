import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  ar: {
    translation: {
      // Common
      "common": {
        "loading": "جاري التحميل...",
        "error": "حدث خطأ",
        "success": "نجح",
        "save": "حفظ",
        "cancel": "إلغاء",
        "delete": "حذف",
        "edit": "تعديل",
        "view": "عرض",
        "back": "عودة",
        "submit": "إرسال",
        "search": "بحث",
        "filter": "تصفية",
        "all": "الكل",
        "logout": "تسجيل الخروج",
        "welcome": "مرحباً بك"
      },
      
      // Brand
      "brand": {
        "name": "بديل",
        "fullName": "منصة بديل التعليمية",
        "tagline": "نربط المعلمين المؤهلين بالطلاب والمدارس والأولياء لتوفير تجربة تعليمية متميزة"
      },
      
      // Navigation
      "nav": {
        "home": "الرئيسية",
        "login": "تسجيل الدخول",
        "signup": "حساب جديد",
        "dashboard": "لوحة التحكم",
        "requests": "الطلبات",
        "assignments": "الجلسات",
        "profile": "الملف الشخصي",
        "users": "المستخدمين",
        "teachers": "المعلمين",
        "students": "الطلاب",
        "reports": "التقارير"
      },
      
      // Auth
      "auth": {
        "loginTitle": "تسجيل الدخول",
        "signupTitle": "إنشاء حساب جديد",
        "email": "البريد الإلكتروني",
        "password": "كلمة المرور",
        "name": "الاسم الكامل",
        "role": "نوع الحساب",
        "loginButton": "تسجيل الدخول",
        "signupButton": "إنشاء الحساب",
        "orSeparator": "أو",
        "googleLogin": "تسجيل الدخول بواسطة Google",
        "googleSignup": "التسجيل بواسطة Google",
        "noAccount": "ليس لديك حساب؟",
        "haveAccount": "لديك حساب؟",
        "signupLink": "سجل الآن",
        "loginLink": "سجل الدخول",
        "loggingIn": "جاري تسجيل الدخول...",
        "signingUp": "جاري التسجيل...",
        "unauthorized": "غير مصرح",
        "unauthorizedMessage": "ليس لديك صلاحية للوصول إلى هذه الصفحة",
        "backToHome": "العودة للرئيسية"
      },
      
      // Roles
      "roles": {
        "admin": "مدير النظام",
        "school_admin": "مدير مدرسة",
        "teacher": "معلم",
        "student": "طالب",
        "guardian": "ولي أمر"
      },
      
      // Landing Page
      "landing": {
        "heroTitle": "منصة بديل التعليمية",
        "heroSubtitle": "نربط المعلمين المؤهلين بالطلاب والمدارس والأولياء لتوفير تجربة تعليمية متميزة",
        "getStarted": "ابدأ الآن",
        "servicesTitle": "خدماتنا التعليمية",
        "service1Title": "معلم بديل",
        "service1Desc": "توفير معلمين بدلاء مؤهلين للمدارس عند الحاجة لضمان استمرارية العملية التعليمية",
        "service2Title": "مدارس أهلية عن بعد",
        "service2Desc": "منصة تعليمية رقمية متكاملة توفر تعليماً عن بُعد بجودة عالية ومرونة كاملة",
        "service3Title": "التعليم الشامل",
        "service3Desc": "برامج متخصصة للطلاب ذوي الاحتياجات الخاصة وصعوبات التعلم ورياض الأطفال",
        "whyTitle": "لماذا منصة بديل؟",
        "feature1Title": "معلمون مؤهلون",
        "feature1Desc": "جميع المعلمين معتمدون ومؤهلون بخبرات متنوعة",
        "feature2Title": "مرونة في المواعيد",
        "feature2Desc": "اختر الوقت والطريقة التي تناسبك",
        "feature3Title": "سهولة الاستخدام",
        "feature3Desc": "منصة بسيطة وسهلة الاستخدام للجميع",
        "feature4Title": "متابعة مستمرة",
        "feature4Desc": "تتبع تقدم الطلاب وتقييم الأداء",
        "ctaTitle": "انضم إلى منصة بديل اليوم",
        "ctaSubtitle": "سواء كنت معلماً أو طالباً أو مدرسة، نحن هنا لخدمتك",
        "ctaButton": "سجل الآن مجاناً",
        "footer": "© 2026 منصة بديل التعليمية. جميع الحقوق محفوظة."
      },
      
      // Dashboard
      "dashboard": {
        "adminTitle": "لوحة التحكم",
        "schoolAdminTitle": "لوحة تحكم المدرسة",
        "teacherTitle": "لوحة تحكم المعلم",
        "studentTitle": "لوحة تحكم الطالب",
        "overview": "نظرة عامة",
        "quickActions": "إجراءات سريعة",
        "totalRequests": "إجمالي الطلبات",
        "completedSessions": "الجلسات المكتملة",
        "activeTeachers": "المعلمين النشطين",
        "activeStudents": "الطلاب النشطين",
        "pendingRequests": "الطلبات المعلقة",
        "myRequests": "طلباتي",
        "mySessions": "جلساتي",
        "availableRequests": "الطلبات المتاحة",
        "currentSessions": "جلساتي الحالية",
        "scheduledSessions": "جلسات مجدولة",
        "viewAll": "عرض الكل",
        "noRequests": "لا توجد طلبات متاحة حالياً",
        "noRequestsCreated": "لم تقم بإنشاء أي طلبات بعد",
        "createFirstRequest": "إنشاء أول طلب",
        "viewAllRequests": "عرض جميع الطلبات",
        "viewAllSessions": "عرض جميع الجلسات",
        "manageRequests": "إدارة ومتابعة الطلبات التعليمية",
        "manageSessions": "متابعة الجلسات التعليمية",
        "welcomeMessage": "مرحباً بك في لوحة التحكم الخاصة بالمدير. يمكنك من هنا إدارة جميع جوانب المنصة.",
        "availableTeachers": "المعلمين المتاحين"
      },
      
      // Requests
      "requests": {
        "title": "الطلبات",
        "createNew": "إنشاء طلب جديد",
        "myRequests": "طلباتي",
        "availableRequests": "الطلبات المتاحة",
        "requestDetails": "تفاصيل الطلب",
        "serviceType": "نوع الخدمة",
        "subject": "المادة",
        "grade": "الصف",
        "mode": "طريقة التعليم",
        "city": "المدينة",
        "dateTime": "التاريخ والوقت",
        "notes": "ملاحظات إضافية",
        "status": "الحالة",
        "createdAt": "تاريخ الإنشاء",
        "viewDetails": "عرض التفاصيل",
        "acceptRequest": "قبول الطلب",
        "accepting": "جاري القبول...",
        "accepted": "تم القبول",
        "createRequest": "إنشاء طلب تعليمي",
        "fillForm": "قم بملء النموذج أدناه لطلب معلم",
        "sendRequest": "إرسال الطلب",
        "sending": "جاري الإنشاء...",
        "requestCreated": "تم إنشاء الطلب بنجاح!",
        "requestAccepted": "تم قبول الطلب بنجاح!",
        "noRequests": "لا توجد طلبات",
        "filterBy": "تصفية:",
        "requestsCount": "طلب",
        "cityOptional": "المدينة (إذا كان حضوري)",
        "notesPlaceholder": "أي معلومات إضافية تريد ذكرها..."
      },
      
      // Service Types
      "serviceTypes": {
        "substitute": "معلم بديل",
        "remote_school": "مدرسة عن بعد",
        "special_education": "تعليم شامل"
      },
      
      // Modes
      "modes": {
        "in_person": "حضوري",
        "remote": "عن بعد"
      },
      
      // Status
      "status": {
        "new": "جديد",
        "offered": "معروض",
        "accepted": "مقبول",
        "assigned": "معيّن",
        "in_progress": "جاري",
        "completed": "مكتمل",
        "cancelled": "ملغى",
        "scheduled": "مجدول"
      },
      
      // Assignments
      "assignments": {
        "title": "جلساتي التعليمية",
        "viewAndManage": "عرض وإدارة جلساتك",
        "noAssignments": "لا توجد جلسات حالياً",
        "sessionLink": "رابط الجلسة",
        "educationalSession": "جلسة تعليمية"
      },
      
      // Profile
      "profile": {
        "title": "ملفي الشخصي",
        "updateInfo": "قم بتحديث معلوماتك الشخصية",
        "specialization": "التخصص",
        "grades": "الصفوف (مفصولة بفواصل)",
        "cities": "المدن (مفصولة بفواصل)",
        "availability": "التوفر",
        "remoteEnabled": "تعليم عن بعد",
        "inPersonEnabled": "تعليم حضوري",
        "bio": "نبذة عني",
        "bioPlaceholder": "اكتب نبذة مختصرة عنك...",
        "saveProfile": "حفظ الملف الشخصي",
        "saving": "جاري الحفظ...",
        "saved": "تم حفظ الملف الشخصي بنجاح!",
        "onlyForTeachers": "هذه الصفحة متاحة للمعلمين فقط",
        "specializationPlaceholder": "مثلاً: رياضيات",
        "gradesPlaceholder": "مثلاً: العاشر, الحادي عشر, الثاني عشر",
        "citiesPlaceholder": "مثلاً: الرياض, جدة, الدمام",
        "availabilityPlaceholder": "مثلاً: الأحد إلى الخميس 8ص - 3م"
      }
    }
  },
  en: {
    translation: {
      // Common
      "common": {
        "loading": "Loading...",
        "error": "Error occurred",
        "success": "Success",
        "save": "Save",
        "cancel": "Cancel",
        "delete": "Delete",
        "edit": "Edit",
        "view": "View",
        "back": "Back",
        "submit": "Submit",
        "search": "Search",
        "filter": "Filter",
        "all": "All",
        "logout": "Logout",
        "welcome": "Welcome"
      },
      
      // Brand
      "brand": {
        "name": "Badeel",
        "fullName": "Badeel Educational Platform",
        "tagline": "Connecting qualified teachers with students, schools, and guardians for an exceptional learning experience"
      },
      
      // Navigation
      "nav": {
        "home": "Home",
        "login": "Login",
        "signup": "Sign Up",
        "dashboard": "Dashboard",
        "requests": "Requests",
        "assignments": "Sessions",
        "profile": "Profile",
        "users": "Users",
        "teachers": "Teachers",
        "students": "Students",
        "reports": "Reports"
      },
      
      // Auth
      "auth": {
        "loginTitle": "Login",
        "signupTitle": "Create New Account",
        "email": "Email",
        "password": "Password",
        "name": "Full Name",
        "role": "Account Type",
        "loginButton": "Login",
        "signupButton": "Create Account",
        "orSeparator": "OR",
        "googleLogin": "Login with Google",
        "googleSignup": "Sign up with Google",
        "noAccount": "Don't have an account?",
        "haveAccount": "Already have an account?",
        "signupLink": "Sign up now",
        "loginLink": "Login",
        "loggingIn": "Logging in...",
        "signingUp": "Signing up...",
        "unauthorized": "Unauthorized",
        "unauthorizedMessage": "You don't have permission to access this page",
        "backToHome": "Back to Home"
      },
      
      // Roles
      "roles": {
        "admin": "System Admin",
        "school_admin": "School Admin",
        "teacher": "Teacher",
        "student": "Student",
        "guardian": "Guardian"
      },
      
      // Landing Page
      "landing": {
        "heroTitle": "Badeel Educational Platform",
        "heroSubtitle": "Connecting qualified teachers with students, schools, and guardians for an exceptional learning experience",
        "getStarted": "Get Started",
        "servicesTitle": "Our Educational Services",
        "service1Title": "Substitute Teacher",
        "service1Desc": "Providing qualified substitute teachers for schools when needed to ensure continuity of the educational process",
        "service2Title": "Remote Private Schools",
        "service2Desc": "A comprehensive digital educational platform providing high-quality remote learning with complete flexibility",
        "service3Title": "Inclusive Education",
        "service3Desc": "Specialized programs for students with special needs, learning difficulties, and kindergarten",
        "whyTitle": "Why Badeel Platform?",
        "feature1Title": "Qualified Teachers",
        "feature1Desc": "All teachers are certified and qualified with diverse experiences",
        "feature2Title": "Flexible Schedule",
        "feature2Desc": "Choose the time and method that suits you",
        "feature3Title": "Easy to Use",
        "feature3Desc": "A simple and easy-to-use platform for everyone",
        "feature4Title": "Continuous Follow-up",
        "feature4Desc": "Track student progress and performance evaluation",
        "ctaTitle": "Join Badeel Platform Today",
        "ctaSubtitle": "Whether you're a teacher, student, or school, we're here to serve you",
        "ctaButton": "Sign Up Free Now",
        "footer": "© 2026 Badeel Educational Platform. All rights reserved."
      },
      
      // Dashboard
      "dashboard": {
        "adminTitle": "Dashboard",
        "schoolAdminTitle": "School Dashboard",
        "teacherTitle": "Teacher Dashboard",
        "studentTitle": "Student Dashboard",
        "overview": "Overview",
        "quickActions": "Quick Actions",
        "totalRequests": "Total Requests",
        "completedSessions": "Completed Sessions",
        "activeTeachers": "Active Teachers",
        "activeStudents": "Active Students",
        "pendingRequests": "Pending Requests",
        "myRequests": "My Requests",
        "mySessions": "My Sessions",
        "availableRequests": "Available Requests",
        "currentSessions": "Current Sessions",
        "scheduledSessions": "Scheduled Sessions",
        "viewAll": "View All",
        "noRequests": "No requests available at the moment",
        "noRequestsCreated": "You haven't created any requests yet",
        "createFirstRequest": "Create First Request",
        "viewAllRequests": "View All Requests",
        "viewAllSessions": "View All Sessions",
        "manageRequests": "Manage and track educational requests",
        "manageSessions": "Track educational sessions",
        "welcomeMessage": "Welcome to the admin dashboard. You can manage all aspects of the platform from here.",
        "availableTeachers": "Available Teachers"
      },
      
      // Requests
      "requests": {
        "title": "Requests",
        "createNew": "Create New Request",
        "myRequests": "My Requests",
        "availableRequests": "Available Requests",
        "requestDetails": "Request Details",
        "serviceType": "Service Type",
        "subject": "Subject",
        "grade": "Grade",
        "mode": "Teaching Mode",
        "city": "City",
        "dateTime": "Date & Time",
        "notes": "Additional Notes",
        "status": "Status",
        "createdAt": "Created At",
        "viewDetails": "View Details",
        "acceptRequest": "Accept Request",
        "accepting": "Accepting...",
        "accepted": "Accepted",
        "createRequest": "Create Educational Request",
        "fillForm": "Fill out the form below to request a teacher",
        "sendRequest": "Send Request",
        "sending": "Creating...",
        "requestCreated": "Request created successfully!",
        "requestAccepted": "Request accepted successfully!",
        "noRequests": "No requests available",
        "filterBy": "Filter:",
        "requestsCount": "request(s)",
        "cityOptional": "City (if in-person)",
        "notesPlaceholder": "Any additional information you want to mention..."
      },
      
      // Service Types
      "serviceTypes": {
        "substitute": "Substitute Teacher",
        "remote_school": "Remote School",
        "special_education": "Special Education"
      },
      
      // Modes
      "modes": {
        "in_person": "In-Person",
        "remote": "Remote"
      },
      
      // Status
      "status": {
        "new": "New",
        "offered": "Offered",
        "accepted": "Accepted",
        "assigned": "Assigned",
        "in_progress": "In Progress",
        "completed": "Completed",
        "cancelled": "Cancelled",
        "scheduled": "Scheduled"
      },
      
      // Assignments
      "assignments": {
        "title": "My Educational Sessions",
        "viewAndManage": "View and manage your sessions",
        "noAssignments": "No sessions at the moment",
        "sessionLink": "Session Link",
        "educationalSession": "Educational Session"
      },
      
      // Profile
      "profile": {
        "title": "My Profile",
        "updateInfo": "Update your personal information",
        "specialization": "Specialization",
        "grades": "Grades (comma separated)",
        "cities": "Cities (comma separated)",
        "availability": "Availability",
        "remoteEnabled": "Remote Teaching",
        "inPersonEnabled": "In-Person Teaching",
        "bio": "About Me",
        "bioPlaceholder": "Write a brief bio about yourself...",
        "saveProfile": "Save Profile",
        "saving": "Saving...",
        "saved": "Profile saved successfully!",
        "onlyForTeachers": "This page is only available for teachers",
        "specializationPlaceholder": "e.g., Mathematics",
        "gradesPlaceholder": "e.g., 10th, 11th, 12th",
        "citiesPlaceholder": "e.g., Riyadh, Jeddah, Dammam",
        "availabilityPlaceholder": "e.g., Sunday to Thursday 8am - 3pm"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
