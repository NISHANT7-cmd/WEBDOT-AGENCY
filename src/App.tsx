import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AdminCommandDashboard from './components/AdminCommandDashboard';
import CaseStudyModal from './components/CaseStudyModal';
import { Project, Testimonial, Inquiry, StatItem, Quotation } from './types';
import { 
  initialProjects, 
  initialTestimonials, 
  initialInquiries, 
  initialStats,
  initialCategories
} from './initialData';
import { Calendar, Check, X, ShieldAlert, Sparkles, Send, Phone, MessageSquare, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

const getLocalStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState<'website' | 'command'>('website');
  
  // Admin Mode States
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('webdot_admin_authorized') === 'true';
  });
  const [showAdminToast, setShowAdminToast] = useState(false);
  
  // Local storage hydrated states
  const [projects, setProjects] = useState<Project[]>(() => getLocalStorage('webdot_projects', initialProjects));
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getLocalStorage('webdot_testimonials', initialTestimonials));
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => getLocalStorage('webdot_inquiries', initialInquiries));
  const [stats, setStats] = useState<StatItem[]>(() => getLocalStorage('webdot_stats', initialStats));
  const [categories, setCategories] = useState<string[]>(() => getLocalStorage('webdot_categories', initialCategories));
  const [quotations, setQuotations] = useState<Quotation[]>(() => getLocalStorage('webdot_quotations', []));
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projectsRef = React.useRef(projects);
  const testimonialsRef = React.useRef(testimonials);
  const inquiriesRef = React.useRef(inquiries);
  const categoriesRef = React.useRef(categories);
  const quotationsRef = React.useRef(quotations);

  projectsRef.current = projects;
  testimonialsRef.current = testimonials;
  inquiriesRef.current = inquiries;
  categoriesRef.current = categories;
  quotationsRef.current = quotations;

  // Real-time Event Logging Terminal
  const [systemLogs, setSystemLogs] = useState<string[]>(() => [
    `[${new Date().toLocaleTimeString()}] COMMAND TERMINAL ONLINE // SECURE DEPLOYMENT`,
    `[${new Date().toLocaleTimeString()}] INTERSTELLAR STATE-STREAM ESTABLISHED // AUTH_OK`,
    `[${new Date().toLocaleTimeString()}] COGNITIVE CACHE HYDRATED: ${getLocalStorage('webdot_projects', initialProjects).length} CATALOG ITEMS LOADED`
  ]);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [...prev, `[${time}] ${message}`]);
  };

  // Secret URL / Hash detector for Admin entry
  React.useEffect(() => {
    const checkAdminAccess = () => {
      // Guard against running multiple times or during an active authenticated session
      if (sessionStorage.getItem('webdot_authenticated') === 'true') {
        return;
      }
      const search = window.location.search;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(search);
      
      const hasSecretQuery = 
        searchParams.has('admin') || 
        searchParams.get('secret') === 'webdot-admin' || 
        searchParams.get('portal') === 'secure' ||
        searchParams.has('portal');
        
      const hasSecretHash = 
        hash === '#admin' || 
        hash === '#/admin' || 
        hash === '#admin-portal' || 
        hash === '#webdot-admin';

      if (hasSecretQuery || hasSecretHash) {
        setIsAdmin(true);
        localStorage.setItem('webdot_admin_authorized', 'true');
        sessionStorage.setItem('webdot_authenticated', 'true');
        setCurrentView('command');
        setShowAdminToast(true);
        addLog(`SECURITY_ALERT: Secure admin entry bypass detected via URL route. Session activated.`);
        
        // Clean URL to prevent the secret path from leaking in screens/history
        try {
          const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (e) {
          console.warn("Could not clean URL params:", e);
        }

        // Auto hide notification toast after 5 seconds
        setTimeout(() => {
          setShowAdminToast(false);
        }, 5000);
      }
    };

    checkAdminAccess();
    window.addEventListener('hashchange', checkAdminAccess);
    return () => window.removeEventListener('hashchange', checkAdminAccess);
  }, []);

  const handleLockPortal = () => {
    setIsAdmin(false);
    localStorage.removeItem('webdot_admin_authorized');
    sessionStorage.removeItem('webdot_authenticated');
    setCurrentView('website');
    addLog(`SECURITY_ALERT: Admin session manually locked and deauthorized. Entry links hidden.`);
  };

  const [isServerOnline, setIsServerOnline] = useState(true);
  const isServerOnlineRef = React.useRef(true);

  const setServerOnline = (online: boolean) => {
    setIsServerOnline(online);
    isServerOnlineRef.current = online;
  };

  // Client-side statistics fallback calculator for environments like Vercel (static deployment)
  const calculateStatsLocally = React.useCallback((
    currentProjects: Project[],
    currentTestimonials: Testimonial[],
    currentInquiries: Inquiry[]
  ) => {
    const totalLeads = currentInquiries.length;
    const activeProjects = currentProjects.filter(p => p.status === 'published').length;
    const approvedReviews = currentTestimonials.filter(t => t.status === 'approved').length;
    const totalVisitors = Number(localStorage.getItem('webdot_visitors')) || 1420;

    const localPerformance = (() => {
      try {
        const perf = localStorage.getItem('webdot_performance');
        return perf ? JSON.parse(perf) : {
          traffic: [1200, 1280, 1310, 1390, 1405, 1412, totalVisitors],
          leads: [12, 14, 18, 15, 22, 24, totalLeads]
        };
      } catch {
        return {
          traffic: [1200, 1280, 1310, 1390, 1405, 1412, totalVisitors],
          leads: [12, 14, 18, 15, 22, 24, totalLeads]
        };
      }
    })();

    // Dynamically align today's index in sparkline charts
    const today = new Date().getDay();
    const index = today === 0 ? 6 : today - 1;
    localPerformance.traffic[index] = Math.max(localPerformance.traffic[index] || 0, totalVisitors);
    localPerformance.leads[index] = Math.max(localPerformance.leads[index] || 0, totalLeads);
    localStorage.setItem('webdot_performance', JSON.stringify(localPerformance));

    const localStats: StatItem[] = [
      {
        id: 'leads',
        label: 'Total Leads',
        value: totalLeads.toLocaleString(),
        change: '+12% ↑',
        status: 'growth',
        icon: 'person_add',
        sparkline: localPerformance.leads
      },
      {
        id: 'projects',
        label: 'Active Projects',
        value: activeProjects.toString(),
        change: 'Stable',
        status: 'stable',
        icon: 'rocket_launch',
        sparkline: [10, 18, 10, 15, 5, 12, activeProjects]
      },
      {
        id: 'visitors',
        label: 'Website Visitors',
        value: totalVisitors >= 1000 ? (totalVisitors / 1000).toFixed(1) + 'k' : totalVisitors.toString(),
        change: '+4% ↑',
        status: 'growth',
        icon: 'visibility',
        sparkline: localPerformance.traffic
      },
      {
        id: 'reviews',
        label: 'Approved Reviews',
        value: approvedReviews.toString(),
        change: '+85%',
        status: 'growth',
        icon: 'thumb_up',
        sparkline: [5, 15, 5, 10, 12, 8, approvedReviews]
      }
    ];

    setStats(localStats);
    localStorage.setItem('webdot_stats', JSON.stringify(localStats));
  }, []);

  // Sync state modifications to LocalStorage for full persistence in offline/static environments
  React.useEffect(() => {
    localStorage.setItem('webdot_projects', JSON.stringify(projects));
    if (!isServerOnline) {
      calculateStatsLocally(projects, testimonials, inquiries);
    }
  }, [projects, isServerOnline, calculateStatsLocally]);

  React.useEffect(() => {
    localStorage.setItem('webdot_testimonials', JSON.stringify(testimonials));
    if (!isServerOnline) {
      calculateStatsLocally(projects, testimonials, inquiries);
    }
  }, [testimonials, isServerOnline, calculateStatsLocally]);

  React.useEffect(() => {
    localStorage.setItem('webdot_inquiries', JSON.stringify(inquiries));
    if (!isServerOnline) {
      calculateStatsLocally(projects, testimonials, inquiries);
    }
  }, [inquiries, isServerOnline, calculateStatsLocally]);

  React.useEffect(() => {
    localStorage.setItem('webdot_stats', JSON.stringify(stats));
  }, [stats]);

  React.useEffect(() => {
    localStorage.setItem('webdot_categories', JSON.stringify(categories));
  }, [categories]);

  React.useEffect(() => {
    localStorage.setItem('webdot_quotations', JSON.stringify(quotations));
  }, [quotations]);

  // Ping server on initial load to register real-time visitor hit
  React.useEffect(() => {
    fetch('/api/visitors/ping', { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error('Not OK');
        return res.json();
      })
      .then(data => {
        if (data.success && data.visitors) {
          localStorage.setItem('webdot_visitors', String(data.visitors));
        }
      })
      .catch(err => {
        console.warn('Visitor ping offline, using local metrics:', err);
        const current = Number(localStorage.getItem('webdot_visitors')) || 1420;
        const next = current + 1;
        localStorage.setItem('webdot_visitors', String(next));
      });
  }, []);

  // Sync data function that queries the live Express backend server
  const fetchLiveServerData = React.useCallback(async (isSilent = false) => {
    // If the Express server is known to be offline (e.g. static/Vercel environments), skip the Express ping and fetch Firestore directly
    if (!isServerOnlineRef.current) {
      try {
        const inquiriesSnap = await getDocs(collection(db, "inquiries"));
        const fetchedInquiries = inquiriesSnap.docs.map(docSnap => docSnap.data() as Inquiry);
        fetchedInquiries.sort((a, b) => b.id.localeCompare(a.id));
        setInquiries(fetchedInquiries);
        localStorage.setItem('webdot_inquiries', JSON.stringify(fetchedInquiries));

        const projectsSnap = await getDocs(collection(db, "projects"));
        const fetchedProjects = projectsSnap.docs.map(docSnap => docSnap.data() as Project);
        fetchedProjects.sort((a, b) => b.id.localeCompare(a.id));
        setProjects(fetchedProjects);
        localStorage.setItem('webdot_projects', JSON.stringify(fetchedProjects));

        const testimonialsSnap = await getDocs(collection(db, "testimonials"));
        const fetchedTestimonials = testimonialsSnap.docs.map(docSnap => docSnap.data() as Testimonial);
        fetchedTestimonials.sort((a, b) => b.id.localeCompare(a.id));
        setTestimonials(fetchedTestimonials);
        localStorage.setItem('webdot_testimonials', JSON.stringify(fetchedTestimonials));

        // Fetch categories directly from firestore
        const categoriesSnap = await getDocs(collection(db, "categories"));
        let fetchedCategories = categoriesSnap.docs.map(docSnap => (docSnap.data() as any).name as string);
        if (fetchedCategories.length === 0) {
          fetchedCategories = initialCategories;
        } else {
          fetchedCategories.sort((a, b) => a.localeCompare(b));
        }
        setCategories(fetchedCategories);
        localStorage.setItem('webdot_categories', JSON.stringify(fetchedCategories));

        // Fetch quotations directly from firestore
        try {
          const quotationsSnap = await getDocs(collection(db, "quotations"));
          const fetchedQuotations = quotationsSnap.docs.map(docSnap => docSnap.data() as Quotation);
          setQuotations(fetchedQuotations);
          localStorage.setItem('webdot_quotations', JSON.stringify(fetchedQuotations));
        } catch (qErr) {
          console.warn("Direct quotations firestore query failed on offline-mode:", qErr);
        }

        // Fetch metrics
        const metricsDoc = await getDoc(doc(db, "metrics", "dashboard"));
        if (metricsDoc.exists()) {
          const metrics = metricsDoc.data();
          const totalLeads = fetchedInquiries.length;
          const activeProjects = fetchedProjects.filter(p => p.status === 'published').length;
          const approvedReviews = fetchedTestimonials.filter(t => t.status === 'approved').length;
          const totalVisitors = metrics.visitors || 8420;
          
          const localStats = [
            {
              id: 'leads',
              label: 'Total Leads',
              value: totalLeads.toLocaleString(),
              change: '+12% ↑',
              status: 'growth',
              icon: 'person_add',
              sparkline: metrics.weeklyPerformance?.leads || [15, 5, 12, 8, 15, 5, 10]
            },
            {
              id: 'projects',
              label: 'Active Projects',
              value: activeProjects.toString(),
              change: 'Stable',
              status: 'stable',
              icon: 'rocket_launch',
              sparkline: [10, 18, 10, 15, 5, 12, activeProjects]
            },
            {
              id: 'visitors',
              label: 'Website Visitors',
              value: totalVisitors >= 1000 ? (totalVisitors / 1000).toFixed(1) + 'k' : totalVisitors.toString(),
              change: '+4% ↑',
              status: 'growth',
              icon: 'visibility',
              sparkline: metrics.weeklyPerformance?.traffic || [180, 100, 150, 50, 120, 80, 150]
            },
            {
              id: 'reviews',
              label: 'Approved Reviews',
              value: approvedReviews.toString(),
              change: '+85%',
              status: 'growth',
              icon: 'thumb_up',
              sparkline: [5, 15, 5, 10, 12, 8, approvedReviews]
            }
          ];
          setStats(localStats);
          localStorage.setItem('webdot_stats', JSON.stringify(localStats));
        }
        if (!isSilent) {
          addLog(`SYNC_COMPLETE: Live data stream pulled directly from Cloud Firestore (Vercel Serverless mode).`);
        }
      } catch (fbError) {
        console.error('Direct Firestore fetch failed:', fbError);
        setServerOnline(false);
        calculateStatsLocally(projectsRef.current, testimonialsRef.current, inquiriesRef.current);
        if (!isSilent) {
          addLog(`SYNC_WARNING: Live server and Cloud Firestore unreachable. Cascaded to LocalStorage.`);
        }
      }
      return;
    }

    try {
      const statsRes = await fetch('/api/dashboard/stats');
      if (!statsRes.ok) throw new Error('API server unreachable');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
        localStorage.setItem('webdot_stats', JSON.stringify(statsData.stats));
      }

      const projectsRes = await fetch('/api/projects');
      if (!projectsRes.ok) throw new Error('API server unreachable');
      const projectsData = await projectsRes.json();
      if (projectsData.success) {
        setProjects(projectsData.projects);
        localStorage.setItem('webdot_projects', JSON.stringify(projectsData.projects));
      }

      const inquiriesRes = await fetch('/api/inquiries');
      if (!inquiriesRes.ok) throw new Error('API server unreachable');
      const inquiriesData = await inquiriesRes.json();
      if (inquiriesData.success) {
        setInquiries(inquiriesData.inquiries);
        localStorage.setItem('webdot_inquiries', JSON.stringify(inquiriesData.inquiries));
      }

      const testimonialsRes = await fetch('/api/testimonials');
      if (!testimonialsRes.ok) throw new Error('API server unreachable');
      const testimonialsData = await testimonialsRes.json();
      if (testimonialsData.success) {
        setTestimonials(testimonialsData.testimonials);
        localStorage.setItem('webdot_testimonials', JSON.stringify(testimonialsData.testimonials));
      }

      const categoriesRes = await fetch('/api/categories');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        if (categoriesData.success) {
          const fetchedCats = categoriesData.categories.map((c: any) => c.name);
          setCategories(fetchedCats);
          localStorage.setItem('webdot_categories', JSON.stringify(fetchedCats));
        }
      }

      const quotationsRes = await fetch('/api/quotations');
      if (quotationsRes.ok) {
        const quotationsData = await quotationsRes.json();
        if (quotationsData.success) {
          setQuotations(quotationsData.quotations);
          localStorage.setItem('webdot_quotations', JSON.stringify(quotationsData.quotations));
        }
      }

      setServerOnline(true);
      if (!isSilent) {
        addLog(`SYNC_COMPLETE: Live real-time dashboard data stream pulled from Express backend.`);
      }
    } catch (error) {
      console.warn('Backend server APIs are unavailable. Cascading to direct Cloud Firestore queries...', error);
      
      // Try to fetch from Firestore directly (e.g. for static Vercel deployment where Express backend is offline)
      try {
        const inquiriesSnap = await getDocs(collection(db, "inquiries"));
        const fetchedInquiries = inquiriesSnap.docs.map(docSnap => docSnap.data() as Inquiry);
        fetchedInquiries.sort((a, b) => b.id.localeCompare(a.id));
        setInquiries(fetchedInquiries);
        localStorage.setItem('webdot_inquiries', JSON.stringify(fetchedInquiries));

        const projectsSnap = await getDocs(collection(db, "projects"));
        const fetchedProjects = projectsSnap.docs.map(docSnap => docSnap.data() as Project);
        fetchedProjects.sort((a, b) => b.id.localeCompare(a.id));
        setProjects(fetchedProjects);
        localStorage.setItem('webdot_projects', JSON.stringify(fetchedProjects));

        const testimonialsSnap = await getDocs(collection(db, "testimonials"));
        const fetchedTestimonials = testimonialsSnap.docs.map(docSnap => docSnap.data() as Testimonial);
        fetchedTestimonials.sort((a, b) => b.id.localeCompare(a.id));
        setTestimonials(fetchedTestimonials);
        localStorage.setItem('webdot_testimonials', JSON.stringify(fetchedTestimonials));

        // Fetch categories directly from firestore
        const categoriesSnap = await getDocs(collection(db, "categories"));
        let fetchedCategories = categoriesSnap.docs.map(docSnap => (docSnap.data() as any).name as string);
        if (fetchedCategories.length === 0) {
          fetchedCategories = initialCategories;
        } else {
          fetchedCategories.sort((a, b) => a.localeCompare(b));
        }
        setCategories(fetchedCategories);
        localStorage.setItem('webdot_categories', JSON.stringify(fetchedCategories));

        // Fetch quotations directly from firestore
        try {
          const quotationsSnap = await getDocs(collection(db, "quotations"));
          const fetchedQuotations = quotationsSnap.docs.map(docSnap => docSnap.data() as Quotation);
          setQuotations(fetchedQuotations);
          localStorage.setItem('webdot_quotations', JSON.stringify(fetchedQuotations));
        } catch (qErr) {
          console.warn("Direct quotations firestore query failed on catch fallback:", qErr);
        }

        // Fetch metrics
        const metricsDoc = await getDoc(doc(db, "metrics", "dashboard"));
        if (metricsDoc.exists()) {
          const metrics = metricsDoc.data();
          const totalLeads = fetchedInquiries.length;
          const activeProjects = fetchedProjects.filter(p => p.status === 'published').length;
          const approvedReviews = fetchedTestimonials.filter(t => t.status === 'approved').length;
          const totalVisitors = metrics.visitors || 8420;
          
          const localStats = [
            {
              id: 'leads',
              label: 'Total Leads',
              value: totalLeads.toLocaleString(),
              change: '+12% ↑',
              status: 'growth',
              icon: 'person_add',
              sparkline: metrics.weeklyPerformance?.leads || [15, 5, 12, 8, 15, 5, 10]
            },
            {
              id: 'projects',
              label: 'Active Projects',
              value: activeProjects.toString(),
              change: 'Stable',
              status: 'stable',
              icon: 'rocket_launch',
              sparkline: [10, 18, 10, 15, 5, 12, activeProjects]
            },
            {
              id: 'visitors',
              label: 'Website Visitors',
              value: totalVisitors >= 1000 ? (totalVisitors / 1000).toFixed(1) + 'k' : totalVisitors.toString(),
              change: '+4% ↑',
              status: 'growth',
              icon: 'visibility',
              sparkline: metrics.weeklyPerformance?.traffic || [180, 100, 150, 50, 120, 80, 150]
            },
            {
              id: 'reviews',
              label: 'Approved Reviews',
              value: approvedReviews.toString(),
              change: '+85%',
              status: 'growth',
              icon: 'thumb_up',
              sparkline: [5, 15, 5, 10, 12, 8, approvedReviews]
            }
          ];
          setStats(localStats);
          localStorage.setItem('webdot_stats', JSON.stringify(localStats));
        }

        setServerOnline(false); // Express backend is offline, but Firestore direct connection is live. Mark as Express offline to stop repetitive fetch errors.
        if (!isSilent) {
          addLog(`SYNC_COMPLETE: Live data stream pulled directly from Cloud Firestore (Vercel Serverless mode).`);
        }
      } catch (fbError) {
        console.error('Direct Firestore fetch failed:', fbError);
        setServerOnline(false);
        calculateStatsLocally(projectsRef.current, testimonialsRef.current, inquiriesRef.current);
        if (!isSilent) {
          addLog(`SYNC_WARNING: Live server and Cloud Firestore unreachable. Cascaded to LocalStorage.`);
        }
      }
    }
  }, [calculateStatsLocally]);

  // Perform initial fetch on mount and setup polling
  React.useEffect(() => {
    fetchLiveServerData(false);

    // Set up a live real-time refresh interval every 5 seconds
    const pollingInterval = setInterval(() => {
      fetchLiveServerData(true);
    }, 5000);

    return () => clearInterval(pollingInterval);
  }, [fetchLiveServerData]);
  
  // Dialog modal states
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [consultationSuccess, setConsultationSuccess] = useState(false);
  const [consultForm, setConsultForm] = useState({ name: '', email: '', date: '', notes: '' });

  // Navigation action
  const handleNavigate = (view: 'website' | 'command') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addLog(`VIEW_CHANGE: Switched context to layout view '${view.toUpperCase()}'`);
  };

  // Toggle Publish/Draft project
  const handleToggleProjectStatus = async (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    const nextStatus = proj.status === 'published' ? 'draft' : 'published';

    // Update locally immediately for instant visual feedback
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`CATALOG_STATUS_UPDATE: Project '${id}' toggled live to '${nextStatus}' on backend.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation...', err);
      try {
        await updateDoc(doc(db, "projects", id), { status: nextStatus });
        addLog(`CATALOG_STATUS_UPDATE: Project '${id}' toggled to '${nextStatus}' directly via Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
        addLog(`SYNC_ERROR: Failed to save project status toggle to database.`);
      }
    }
  };

  // Create new project catalog
  const handleAddProject = async (newProj: Project) => {
    setProjects(prev => [newProj, ...prev]);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProj)
      });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`CATALOG_ITEM_CREATED: Published case study '${newProj.name}' live to server.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation...', err);
      try {
        await setDoc(doc(db, "projects", newProj.id), newProj);
        addLog(`CATALOG_ITEM_CREATED: Case study '${newProj.name}' created directly in Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
        addLog(`SYNC_ERROR: Failed to register new project catalog on database.`);
      }
    }
  };

  // Add dynamic project category
  const handleAddCategory = async (catName: string) => {
    const trimmed = catName.trim();
    if (!trimmed) return;
    
    // Check if it already exists
    if (categoriesRef.current.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      addLog(`CATEGORY_WARNING: Category '${trimmed}' already exists.`);
      return;
    }

    setCategories(prev => [...prev, trimmed].sort((a, b) => a.localeCompare(b)));

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed })
      });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`CATEGORY_CREATED: Dynamic project category '${trimmed}' added successfully.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation for category...', err);
      try {
        const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await setDoc(doc(db, "categories", id), { id, name: trimmed });
        addLog(`CATEGORY_CREATED: Dynamic project category '${trimmed}' saved directly to Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
        addLog(`SYNC_ERROR: Failed to save dynamic category on database.`);
      }
    }
  };

  // Delete project category
  const handleDeleteCategory = async (catName: string) => {
    const trimmed = catName.trim();
    if (!trimmed) return;

    setCategories(prev => prev.filter(c => c !== trimmed));

    try {
      const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`CATEGORY_DELETED: Dynamic project category '${trimmed}' deleted successfully.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation for category...', err);
      try {
        const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await deleteDoc(doc(db, "categories", id));
        addLog(`CATEGORY_DELETED: Dynamic project category '${trimmed}' purged directly from Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
        addLog(`SYNC_ERROR: Failed to delete category on database.`);
      }
    }
  };

  // Save or update quotation
  const handleSaveQuotation = async (newQuote: Quotation) => {
    setQuotations(prev => {
      const idx = prev.findIndex(q => q.id === newQuote.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = newQuote;
        return copy;
      }
      return [newQuote, ...prev];
    });

    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuote)
      });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`QUOTATION_SAVED: Quotation for '${newQuote.clientName}' saved successfully.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation for quotation...', err);
      try {
        await setDoc(doc(db, "quotations", newQuote.id), newQuote);
        addLog(`QUOTATION_SAVED: Quotation for '${newQuote.clientName}' saved directly to Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
        addLog(`SYNC_ERROR: Failed to save quotation on database.`);
      }
    }
  };

  // Delete quotation
  const handleDeleteQuotation = async (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));

    try {
      const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`QUOTATION_DELETED: Quotation purged successfully.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation...', err);
      try {
        await deleteDoc(doc(db, "quotations", id));
        addLog(`QUOTATION_DELETED: Quotation purged directly from Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
        addLog(`SYNC_ERROR: Failed to delete quotation from database.`);
      }
    }
  };

  // Delete project case study
  const handleDeleteProject = async (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`CATALOG_ITEM_DELETED: Project '${id}' purged from server-side store.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation...', err);
      try {
        await deleteDoc(doc(db, "projects", id));
        addLog(`CATALOG_ITEM_DELETED: Project '${id}' purged directly from Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
        addLog(`SYNC_ERROR: Failed to delete project on database.`);
      }
    }
  };

  // Approve pending testimonial
  const handleApproveTestimonial = async (id: string) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));

    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`TESTIMONIAL_APPROVED: Approved public review submission from '${id}' on server.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation...', err);
      try {
        await updateDoc(doc(db, "testimonials", id), { status: 'approved' });
        addLog(`TESTIMONIAL_APPROVED: Approved public review '${id}' directly in Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
        addLog(`SYNC_ERROR: Failed to approve testimonial on database.`);
      }
    }
  };

  // Reject pending testimonial
  const handleRejectTestimonial = async (id: string) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' } : t));

    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`TESTIMONIAL_REJECTED: Archiving rejected testimonial '${id}' on server.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation...', err);
      try {
        await updateDoc(doc(db, "testimonials", id), { status: 'rejected' });
        addLog(`TESTIMONIAL_REJECTED: Testimonial '${id}' rejected directly in Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
      }
    }
  };

  // Delete Inquiry (Lead resolved)
  const handleDeleteInquiry = async (id: string) => {
    setInquiries(prev => prev.filter(i => i.id !== id));

    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`LEAD_RESOLVED: Lead inquiry '${id}' archived on server.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation...', err);
      try {
        await deleteDoc(doc(db, "inquiries", id));
        addLog(`LEAD_RESOLVED: Lead inquiry '${id}' archived directly in Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
        addLog(`SYNC_ERROR: Failed to resolve lead on database.`);
      }
    }
  };

  // Submit new inquiry form from Landing Page contact section
  const handleInquirySubmit = async (inqData: Omit<Inquiry, 'id' | 'date'>) => {
    const tempInq: Inquiry = {
      ...inqData,
      id: `inq-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setInquiries(prev => [tempInq, ...prev]);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inqData)
      });
      if (!res.ok) throw new Error('Server API failed');
      const data = await res.json();
      if (data.success) {
        addLog(`INCOMING_LEAD_DISPATCH: Lead saved on backend from '${inqData.fullName}' (${inqData.email})`);
      }
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation...', err);
      try {
        await setDoc(doc(db, "inquiries", tempInq.id), tempInq);
        
        // Try incrementing metric
        try {
          const metricsRef = doc(db, "metrics", "dashboard");
          const metricsDoc = await getDoc(metricsRef);
          if (metricsDoc.exists()) {
            const metrics = metricsDoc.data();
            const today = new Date().getDay();
            const index = today === 0 ? 6 : today - 1;
            const leads = [...(metrics.weeklyPerformance?.leads || [15, 5, 12, 8, 15, 5, 10])];
            leads[index] = (leads[index] || 0) + 1;
            await updateDoc(metricsRef, {
              "weeklyPerformance.leads": leads
            });
          }
        } catch (metErr) {
          console.warn('Inquiry metrics update failed:', metErr);
        }

        addLog(`INCOMING_LEAD_DISPATCH: Lead saved directly to Cloud Firestore from '${inqData.fullName}'.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
        addLog(`SYNC_WARNING: Saved inquiry locally (database offline).`);
      }
    }
  };

  // Submit client testimonial from landing page reviews form
  const handleTestimonialSubmit = async (testData: Omit<Testimonial, 'id' | 'status' | 'initials'>) => {
    const initials = testData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const tempTest: Testimonial = {
      ...testData,
      id: `test-${Date.now()}`,
      status: 'pending',
      initials: initials || 'CL'
    };
    setTestimonials(prev => [tempTest, ...prev]);

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`TESTIMONIAL_SUBMITTED: Received feedback draft from '${testData.name}'. Pending authorization.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation...', err);
      try {
        await setDoc(doc(db, "testimonials", tempTest.id), tempTest);
        addLog(`TESTIMONIAL_SUBMITTED: Testimonial from '${testData.name}' saved directly in Cloud Firestore (Pending review).`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
      }
    }
  };

  // Submit customer project case study from landing page form
  const handleClientProjectSubmit = async (projectData: Omit<Project, 'id' | 'status' | 'lastUpdated'>) => {
    const tempProj: Project = {
      ...projectData,
      id: `proj-client-${Date.now()}`,
      status: 'pending',
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    setProjects(prev => [tempProj, ...prev]);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempProj)
      });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`PROJECT_SUBMITTED: Received client proposal '${projectData.name}' from '${projectData.client}'.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation...', err);
      try {
        await setDoc(doc(db, "projects", tempProj.id), tempProj);
        addLog(`PROJECT_SUBMITTED: Case study proposal '${projectData.name}' saved directly in Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
      }
    }
  };

  // Approve client project case study from Admin panel
  const handleApproveProject = async (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'published' } : p));

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' })
      });
      if (!res.ok) throw new Error('Server API failed');
      addLog(`PROJECT_APPROVED: Approved client case study '${id}' on server.`);
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore operation...', err);
      try {
        await updateDoc(doc(db, "projects", id), { status: 'published' });
        addLog(`PROJECT_APPROVED: Case study '${id}' approved directly in Cloud Firestore.`);
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
      }
    }
  };

  // Fallback traffic simulator
  const handleTriggerMockTrafficFallback = () => {
    const mockNames = ['Arthur Dent', 'Ford Prefect', 'Tricia McMillan', 'Zaphod Beeblebrox', 'Marvin Android'];
    const mockEmails = ['arthur@heartofgold.net', 'ford@guide.galaxy', 'trillian@sub-ether.org', 'zaphod@president.galaxy', 'marvin@paranoid.com'];
    const mockServices = ['Website Development', 'AI Automation', 'Enterprise Dashboard', 'E-Commerce Ecosystem'];
    const mockMessages = [
      'We require an interstellar booking client with real-time tachyon state management.',
      'Requesting an automated semantic catalog generator integrated with high-performance edge assets.',
      'Our luxury logistics routing requires custom visualizers matching our retro styling paradigm.',
      'Can you optimize our product checkout systems for mobile-first luxury and low-bandwidth systems?',
      'I have been requested to optimize our support queues, but it will probably be incredibly tedious.'
    ];

    const randomIndex = Math.floor(Math.random() * mockNames.length);
    const mockInquiry: Inquiry = {
      id: `inq-mock-${Date.now()}`,
      fullName: mockNames[randomIndex],
      email: mockEmails[randomIndex],
      service: mockServices[Math.floor(Math.random() * mockServices.length)],
      message: mockMessages[randomIndex],
      date: new Date().toISOString().split('T')[0]
    };

    // Update visitors locally
    const currentVisitors = Number(localStorage.getItem('webdot_visitors')) || 1420;
    const extraVisitors = Math.floor(Math.random() * 85) + 15;
    localStorage.setItem('webdot_visitors', String(currentVisitors + extraVisitors));

    // Append mock lead, which triggers automatic recalculation in useEffect
    setInquiries(prev => [mockInquiry, ...prev]);

    addLog(`SIMULATION_TRIGGERED: Organic lead generated for '${mockInquiry.fullName}' and SEO visitor traffic spiked`);
  };

  // Trigger simulated operation leads & traffic hits (Dynamic simulation)
  const handleTriggerMockTraffic = async () => {
    addLog(`SIMULATION_TRIGGERED: Pinging server to inject live organic SEO traffic and incoming sample leads...`);
    try {
      const res = await fetch('/api/dashboard/simulate-traffic', { method: 'POST' });
      if (!res.ok) throw new Error('Server API failed');
      const data = await res.json();
      if (data.success) {
        addLog(`SIMULATION_SUCCESS: Generated live sample lead for '${data.inquiry.fullName}'. Website hit count is now ${data.visitors}.`);
      }
      fetchLiveServerData(true);
    } catch (err) {
      console.warn('API Server unreachable, attempting direct Firestore simulation...', err);
      try {
        const mockNames = ['Arthur Dent', 'Ford Prefect', 'Tricia McMillan', 'Zaphod Beeblebrox', 'Marvin Android'];
        const mockEmails = ['arthur@heartofgold.net', 'ford@guide.galaxy', 'trillian@sub-ether.org', 'zaphod@president.galaxy', 'marvin@paranoid.com'];
        const mockServices = ['Website Development', 'AI Automation', 'Enterprise Dashboard', 'E-Commerce Ecosystem'];
        const mockMessages = [
          'We require an interstellar booking client with real-time tachyon state management.',
          'Requesting an automated semantic catalog generator integrated with high-performance edge assets.',
          'Our luxury logistics routing requires custom visualizers matching our retro styling paradigm.',
          'Can you optimize our product checkout systems for mobile-first luxury and low-bandwidth systems?',
          'I have been requested to optimize our support queues, but it will probably be incredibly tedious.'
        ];

        const randomIndex = Math.floor(Math.random() * mockNames.length);
        const newInq = {
          id: `inq-mock-${Date.now()}`,
          fullName: mockNames[randomIndex],
          email: mockEmails[randomIndex],
          service: mockServices[Math.floor(Math.random() * mockServices.length)],
          message: mockMessages[randomIndex],
          date: new Date().toISOString().split('T')[0]
        };

        // Write directly to Firestore inquiries
        await setDoc(doc(db, "inquiries", newInq.id), newInq);

        const metricsRef = doc(db, "metrics", "dashboard");
        const metricsDoc = await getDoc(metricsRef);
        if (metricsDoc.exists()) {
          const metrics = metricsDoc.data();
          const visitors = (metrics.visitors || 8420) + Math.floor(Math.random() * 85) + 15;
          const today = new Date().getDay();
          const index = today === 0 ? 6 : today - 1;
          const leads = [...(metrics.weeklyPerformance?.leads || [15, 5, 12, 8, 15, 5, 10])];
          leads[index] = (leads[index] || 0) + 1;
          const traffic = [...(metrics.weeklyPerformance?.traffic || [180, 100, 150, 50, 120, 80, 150])];
          traffic[index] = (traffic[index] || 0) + 15;

          await updateDoc(metricsRef, {
            visitors,
            "weeklyPerformance.leads": leads,
            "weeklyPerformance.traffic": traffic
          });
          
          addLog(`SIMULATION_SUCCESS: Generated lead for '${newInq.fullName}' directly in Cloud Firestore. New hit count is ${visitors}.`);
        }
        fetchLiveServerData(true);
      } catch (fbErr) {
        console.error('Firestore Error:', fbErr);
        handleTriggerMockTrafficFallback();
      }
    }
  };

  // Book custom consultation handler
  const handleBookConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultForm.name || !consultForm.email) return;

    // Send as inquiry to display on portal!
    handleInquirySubmit({
      fullName: consultForm.name,
      email: consultForm.email,
      service: 'Enterprise Dashboard',
      message: `[Consultation Requested for ${consultForm.date}] - Additional Notes: ${consultForm.notes || 'No extra notes provided.'}`
    });

    setConsultationSuccess(true);
    setTimeout(() => {
      setConsultationSuccess(false);
      setShowConsultationModal(false);
      setConsultForm({ name: '', email: '', date: '', notes: '' });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans">
      
      {/* GLOBAL HEADER & NAVIGATION */}
      <Navbar 
        currentView={currentView}
        onNavigate={handleNavigate}
        onBookConsultation={() => setShowConsultationModal(true)}
        isAdmin={isAdmin}
      />

      {/* CORE VIEWPORT */}
      <main className="flex-1">
        {currentView === 'website' ? (
          <LandingPage 
            projects={projects}
            testimonials={testimonials}
            onSelectProject={setSelectedProject}
            onSubmitInquiry={handleInquirySubmit}
            onSubmitTestimonial={handleTestimonialSubmit}
            onSubmitProject={handleClientProjectSubmit}
            categories={categories}
            onAddCategory={handleAddCategory}
          />
        ) : (
          <AdminCommandDashboard 
            projects={projects}
            testimonials={testimonials}
            inquiries={inquiries}
            stats={stats}
            systemLogs={systemLogs}
            onAddLog={addLog}
            onToggleProjectStatus={handleToggleProjectStatus}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
            onApproveProject={handleApproveProject}
            onApproveTestimonial={handleApproveTestimonial}
            onRejectTestimonial={handleRejectTestimonial}
            onDeleteInquiry={handleDeleteInquiry}
            onTriggerMockTraffic={handleTriggerMockTraffic}
            onLockPortal={handleLockPortal}
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            quotations={quotations}
            onSaveQuotation={handleSaveQuotation}
            onDeleteQuotation={handleDeleteQuotation}
          />
        )}
      </main>

      {/* ADMIN SESSION NOTIFICATION TOAST */}
      <AnimatePresence>
        {showAdminToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50 bg-[#0c1020] border border-primary/30 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 max-w-sm backdrop-blur-xl"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-primary">ADMIN DEPLOYED</h4>
              <p className="text-[11px] text-on-surface-variant leading-normal mt-0.5">
                Session verified. Use the <strong className="text-white font-semibold">Command Portal</strong> toggle in the header to manage case studies.
              </p>
            </div>
            <button 
              onClick={() => setShowAdminToast(false)}
              className="text-on-surface-variant hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all ml-1 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX: DETAILED CASE STUDY OVERLAY MODAL */}
      <CaseStudyModal 
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* DIALOG: BOOK CONSULTATION APPOINTMENT SCHEDULER */}
      <AnimatePresence>
        {showConsultationModal && (
          <div className="fixed inset-0 z-[110] bg-background/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-surface-container rounded-3xl border border-white/10 shadow-2xl p-8 overflow-hidden"
            >
              {/* Decorative Blur blob inside */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 glow-blob"></div>

              <button
                onClick={() => setShowConsultationModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold text-on-surface">Book Consultation</h3>
                  <p className="text-xs text-on-surface-variant">Schedule an interactive project call with our founders</p>
                </div>
              </div>

              {consultationSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 border border-primary/25 rounded-full flex items-center justify-center mx-auto text-primary">
                    <Check className="w-8 h-8" />
                  </div>
                  <h4 className="font-display text-lg font-bold text-on-surface">Appointment Requested!</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                    A secure booking slot has been transmitted to our command system. We will contact you soon!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookConsultationSubmit} className="space-y-4 relative z-10 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant font-medium">Full Name</label>
                    <input 
                      type="text" 
                      value={consultForm.name}
                      onChange={(e) => setConsultForm({...consultForm, name: e.target.value})}
                      placeholder="E.g. Elon Mask"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant font-medium">Email Address</label>
                    <input 
                      type="email" 
                      value={consultForm.email}
                      onChange={(e) => setConsultForm({...consultForm, email: e.target.value})}
                      placeholder="E.g. elon@tesla.space"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant font-medium">Preferred Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={consultForm.date}
                      onChange={(e) => setConsultForm({...consultForm, date: e.target.value})}
                      className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant font-medium">Brief Notes / Special Requests</label>
                    <textarea 
                      rows={3}
                      value={consultForm.notes}
                      onChange={(e) => setConsultForm({...consultForm, notes: e.target.value})}
                      placeholder="E.g. Need high-performance WebGL integrations and a custom AI chatbot."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-primary-container text-on-primary-container font-bold py-4 rounded-xl text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    Confirm Appointment Slots <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING DIRECT CONTACT CHANNELS */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* WhatsApp Floating Action */}
        <a 
          href="https://wa.me/917620685718"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-[#111b21] border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-600 hover:border-emerald-500 shadow-xl shadow-emerald-900/20 hover:scale-110 active:scale-90 transition-all group relative cursor-pointer"
          title="Chat with us on WhatsApp"
        >
          <span className="absolute -left-28 top-3 bg-slate-900/90 text-white text-[10px] px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium border border-white/5 backdrop-blur-sm shadow-md whitespace-nowrap">
            WhatsApp Chat
          </span>
          <span className="absolute inset-0 rounded-full border border-emerald-400/50 animate-ping opacity-75"></span>
          <MessageSquare className="w-5 h-5" />
        </a>

        {/* Email Floating Action */}
        <a 
          href="mailto:nishantshewale69@gmail.com"
          className="w-12 h-12 rounded-full bg-slate-900/95 border border-blue-500/25 flex items-center justify-center text-blue-400 hover:text-white hover:bg-blue-600 hover:border-blue-500 shadow-xl shadow-blue-900/10 hover:scale-110 active:scale-90 transition-all group relative cursor-pointer"
          title="Send us an Email"
        >
          <span className="absolute -left-24 top-3 bg-slate-900/90 text-white text-[10px] px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium border border-white/5 backdrop-blur-sm shadow-md whitespace-nowrap">
            Direct Email
          </span>
          <Mail className="w-5 h-5" />
        </a>

        {/* Call Floating Action */}
        <a 
          href="tel:+917620685718"
          className="w-12 h-12 rounded-full bg-slate-900/95 border border-primary/25 flex items-center justify-center text-primary hover:text-white hover:bg-primary hover:border-primary-light shadow-xl shadow-primary/10 hover:scale-110 active:scale-90 transition-all group relative cursor-pointer"
          title="Call Direct"
        >
          <span className="absolute -left-20 top-3 bg-slate-900/90 text-white text-[10px] px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-medium border border-white/5 backdrop-blur-sm shadow-md whitespace-nowrap">
            Voice Call
          </span>
          <Phone className="w-5 h-5" />
        </a>
      </div>

    </div>
  );
}
