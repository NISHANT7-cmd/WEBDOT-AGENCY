import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, Trash2, CheckCircle, Eye, EyeOff, UserPlus, 
  Settings, TrendingUp, Sparkles, MessageSquare, Briefcase, 
  Layers, RefreshCw, Star, Ban, Mail, Check, Terminal, ExternalLink, ShieldAlert,
  DollarSign, Clock, Globe, Cpu, Wand2, Activity, FileText, Download, Edit3, X, Sparkle, Percent
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Project, Testimonial, Inquiry, StatItem, Quotation, QuotationItem, PaymentMilestone } from '../types';
import { resolveProjectImage } from '../utils/imageResolver';

interface AdminCommandDashboardProps {
  projects: Project[];
  testimonials: Testimonial[];
  inquiries: Inquiry[];
  stats: StatItem[];
  systemLogs: string[];
  onAddLog: (message: string) => void;
  onToggleProjectStatus: (id: string) => void;
  onAddProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onApproveProject: (id: string) => void;
  onApproveTestimonial: (id: string) => void;
  onRejectTestimonial: (id: string) => void;
  onDeleteInquiry: (id: string) => void;
  onTriggerMockTraffic: () => void;
  onLockPortal?: () => void;
  categories?: string[];
  onAddCategory?: (category: string) => Promise<void>;
  onDeleteCategory?: (category: string) => Promise<void>;
  quotations?: Quotation[];
  onSaveQuotation?: (quotation: Quotation) => Promise<void>;
  onDeleteQuotation?: (id: string) => Promise<void>;
}

export default function AdminCommandDashboard({
  projects,
  testimonials,
  inquiries,
  stats,
  systemLogs,
  onAddLog,
  onToggleProjectStatus,
  onAddProject,
  onDeleteProject,
  onApproveProject,
  onApproveTestimonial,
  onRejectTestimonial,
  onDeleteInquiry,
  onTriggerMockTraffic,
  onLockPortal,
  categories = [],
  onAddCategory,
  onDeleteCategory,
  quotations = [],
  onSaveQuotation,
  onDeleteQuotation
}: AdminCommandDashboardProps) {
  // Authentication Guard States
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('webdot_authenticated') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Terminal Console States
  const [consoleInput, setConsoleInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const terminalBottomRef = React.useRef<HTMLDivElement>(null);

  // States for adding a new project
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    description: '',
    industry: categories[0] || 'Luxury Real Estate',
    role: '',
    timeline: '',
    tagsString: '',
    liveUrl: 'https://webdot.agency',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    imageSource: 'screenshot' as 'screenshot' | 'custom',
    status: 'draft' as 'published' | 'draft',
    challenge: '',
    solution: '',
    resultsStr1: '32%', resultsLbl1: 'Fuel efficiency improvement',
    resultsStr2: '2.5s', resultsLbl2: 'Average latency',
    resultsStr3: '50k', resultsLbl3: 'Active requests'
  });

  const [showAdminNewCategoryInput, setShowAdminNewCategoryInput] = useState(false);
  const [adminNewCategoryName, setAdminNewCategoryName] = useState('');
  const [panelNewCategoryName, setPanelNewCategoryName] = useState('');

  React.useEffect(() => {
    if (categories.length > 0 && (!newProject.industry || newProject.industry === 'Luxury Real Estate' && !categories.includes('Luxury Real Estate'))) {
      setNewProject(prev => ({ ...prev, industry: categories[0] }));
    }
  }, [categories]);

  // Table active filter state
  const [projectFilter, setProjectFilter] = useState<'all' | 'published' | 'draft' | 'pending'>('all');

  // Tab controller
  const [activePortalTab, setActivePortalTab] = useState<'operations' | 'quotations'>('operations');

  // Quotation Portal states
  const [isEditingQuotation, setIsEditingQuotation] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);

  // Form states for Quotation Editor
  const [quoteClientName, setQuoteClientName] = useState('');
  const [quoteClientCompany, setQuoteClientCompany] = useState('');
  const [quoteClientEmail, setQuoteClientEmail] = useState('');
  const [quoteProjectName, setQuoteProjectName] = useState('');
  const [quoteDate, setQuoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [quoteValidUntil, setQuoteValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30); // 30 days valid by default
    return d.toISOString().split('T')[0];
  });
  const [quoteItems, setQuoteItems] = useState<{ description: string; amount: number }[]>([
    { description: 'UX/UI High-Fidelity Interactive Wireframing & Prototyping', amount: 3500 },
    { description: 'Responsive Frontend Interface Development (React + Tailwind CSS)', amount: 4800 },
    { description: 'Custom Express API Middleware Integration & Cloud Firestore Hookup', amount: 4200 }
  ]);
  const [quoteMilestones, setQuoteMilestones] = useState<{ label: string; percentage: number; amount: number; description: string }[]>([
    { label: 'Advance Commencement Retainer', percentage: 40, amount: 5000, description: 'Due upon execution of agreement before engineering kick-off.' },
    { label: 'Beta Prototype Milestone Delivery', percentage: 30, amount: 3750, description: 'Due upon client approval of core layout and visual architecture.' },
    { label: 'Final Deployment & Production Launch', percentage: 30, amount: 3750, description: 'Due prior to transferring server ownership and final release.' }
  ]);
  const [quoteTerms, setQuoteTerms] = useState<string[]>([
    'Project commencement is contingent upon the clearance of the initial advance commencement retainer payment.',
    'All requested source assets, creative copies, and API secrets must be delivered by the client in a timely manner.',
    'Intellectual property ownership and source repositories will transfer to the client upon final complete payment.',
    'Standard scope support is valid for 30 days post-launch. Subsequent requests will require separate SLA agreements.'
  ]);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteStatus, setQuoteStatus] = useState<'draft' | 'sent' | 'accepted' | 'expired'>('draft');

  const totalQuoteAmount = quoteItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Automatically sync milestone amounts whenever totalQuoteAmount or percentages change
  React.useEffect(() => {
    setQuoteMilestones(prev => prev.map(m => ({
      ...m,
      amount: Math.round((totalQuoteAmount * (Number(m.percentage) || 0)) / 100)
    })));
  }, [totalQuoteAmount]);

  const resetQuotationForm = () => {
    setIsEditingQuotation(false);
    setEditingQuotationId(null);
    setQuoteClientName('');
    setQuoteClientCompany('');
    setQuoteClientEmail('');
    setQuoteProjectName('');
    setQuoteDate(new Date().toISOString().split('T')[0]);
    
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    setQuoteValidUntil(expiry.toISOString().split('T')[0]);

    setQuoteItems([
      { description: 'UX/UI High-Fidelity Interactive Wireframing & Prototyping', amount: 3500 },
      { description: 'Responsive Frontend Interface Development (React + Tailwind CSS)', amount: 4800 },
      { description: 'Custom Express API Middleware Integration & Cloud Firestore Hookup', amount: 4200 }
    ]);
    setQuoteMilestones([
      { label: 'Advance Commencement Retainer', percentage: 40, amount: 5000, description: 'Due upon execution of agreement before engineering kick-off.' },
      { label: 'Beta Prototype Milestone Delivery', percentage: 30, amount: 3750, description: 'Due upon client approval of core layout and visual architecture.' },
      { label: 'Final Deployment & Production Launch', percentage: 30, amount: 3750, description: 'Due prior to transferring server ownership and final release.' }
    ]);
    setQuoteTerms([
      'Project commencement is contingent upon the clearance of the initial advance commencement retainer payment.',
      'All requested source assets, creative copies, and API secrets must be delivered by the client in a timely manner.',
      'Intellectual property ownership and source repositories will transfer to the client upon final complete payment.',
      'Standard scope support is valid for 30 days post-launch. Subsequent requests will require separate SLA agreements.'
    ]);
    setQuoteNotes('');
    setQuoteStatus('draft');
  };

  const handleLoadQuotationForEdit = (q: Quotation) => {
    setIsEditingQuotation(true);
    setEditingQuotationId(q.id);
    setQuoteClientName(q.clientName);
    setQuoteClientCompany(q.clientCompany);
    setQuoteClientEmail(q.clientEmail);
    setQuoteProjectName(q.projectName);
    setQuoteDate(q.date);
    setQuoteValidUntil(q.validUntil);
    setQuoteItems(q.items);
    setQuoteMilestones(q.paymentMilestones);
    setQuoteTerms(q.terms);
    setQuoteNotes(q.notes || '');
    setQuoteStatus(q.status);
  };

  const handleFormSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteClientName || !quoteProjectName) return;

    // Validate milestone percentages sum to 100
    const totalPercentage = quoteMilestones.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);
    if (totalPercentage !== 100) {
      alert(`Milestone percentages must sum up exactly to 100%. Current sum: ${totalPercentage}%`);
      return;
    }

    const quotationData: Quotation = {
      id: editingQuotationId || `QT-${Math.floor(100000 + Math.random() * 900000)}`,
      clientName: quoteClientName,
      clientCompany: quoteClientCompany,
      clientEmail: quoteClientEmail,
      projectName: quoteProjectName,
      date: quoteDate,
      validUntil: quoteValidUntil,
      items: quoteItems,
      paymentMilestones: quoteMilestones.map(m => ({
        ...m,
        amount: Math.round((totalQuoteAmount * (Number(m.percentage) || 0)) / 100)
      })),
      terms: quoteTerms,
      totalAmount: totalQuoteAmount,
      notes: quoteNotes,
      status: quoteStatus
    };

    if (onSaveQuotation) {
      await onSaveQuotation(quotationData);
    }
    resetQuotationForm();
  };

  const handleDownloadQuotationPDF = (quotation: Quotation) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Color Palette
      const primaryColor = [11, 22, 44]; // Deep Slate Blue (#0b162c)
      const accentColor = [59, 130, 246];  // WebDot Cyan/Blue (#3b82f6)
      const textColor = [51, 65, 85];     // Charcoal (#334155)
      const lightBg = [248, 250, 252];    // Cool light gray (#f8fafc)

      // Page 1 Setup
      let y = 20;

      // Header Logo Box
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, y, 45, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('WEBDOT', 20, y + 8);

      // Agency Info
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('WEBDOT CREATIVE AGENCY', 150, y + 4);
      doc.text('hello@webdot.agency', 150, y + 8);
      doc.text('https://webdot.agency', 150, y + 12);

      y += 24;

      // Title "QUOTATION"
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(15, y, 180, 1, 'F');
      
      y += 8;
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('PROJECT QUOTATION', 15, y);

      y += 10;

      // Meta info grid (Left: Quote Metadata, Right: Client Metadata)
      // Box backgrounds
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.rect(15, y, 85, 36, 'F');
      doc.rect(110, y, 85, 36, 'F');

      doc.setFontSize(9);
      // Left: Quote details
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('QUOTATION DETAILS', 20, y + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`Quotation ID: ${quotation.id}`, 20, y + 13);
      doc.text(`Date Issued: ${quotation.date}`, 20, y + 20);
      doc.text(`Valid Until: ${quotation.validUntil}`, 20, y + 27);

      // Right: Client details
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('PREPARED FOR CLIENT', 115, y + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`Client Name: ${quotation.clientName}`, 115, y + 13);
      doc.text(`Company: ${quotation.clientCompany}`, 115, y + 20);
      doc.text(`Email: ${quotation.clientEmail}`, 115, y + 27);

      y += 46;

      // Project Title
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Project Target: ${quotation.projectName}`, 15, y);

      y += 8;

      // Items Table Header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, y, 180, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('SCOPE DESCRIPTION', 20, y + 5.5);
      doc.text('ESTIMATED COST (USD)', 150, y + 5.5);

      y += 8;

      // Items list
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      
      quotation.items.forEach((item, index) => {
        // Alternating fill
        if (index % 2 === 1) {
          doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
          doc.rect(15, y, 180, 8, 'F');
        }
        doc.text(item.description, 20, y + 5.5);
        doc.text(`$${item.amount.toLocaleString()}`, 150, y + 5.5);
        y += 8;
      });

      // Table bottom border line
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, y, 180, 0.5, 'F');

      y += 8;

      // Total Summary Panel
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('TOTAL PROJECT BUDGET', 90, y);
      doc.setFontSize(12);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`$${quotation.totalAmount.toLocaleString()}`, 150, y);

      y += 12;

      // Payment Schedule
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('PAYMENT MILESTONES & SCHEDULE', 15, y);
      
      y += 6;
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(15, y, 30, 0.8, 'F');
      
      y += 8;

      quotation.paymentMilestones.forEach((milestone) => {
        // Check page height space
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`${milestone.label} (${milestone.percentage}%)`, 15, y);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(`$${milestone.amount.toLocaleString()}`, 150, y);
        
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        
        // Wrap text for long description
        const lines = doc.splitTextToSize(milestone.description, 170);
        doc.text(lines, 15, y);
        
        y += (lines.length * 4) + 6;
      });

      // Terms and Conditions Section (Page break if space is tight)
      if (y > 200) {
        doc.addPage();
        y = 20;
      } else {
        y += 8;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('TERMS & CONDITIONS', 15, y);
      
      y += 6;
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(15, y, 30, 0.8, 'F');
      
      y += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      quotation.terms.forEach((term) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        const lines = doc.splitTextToSize(term, 175);
        doc.text(lines, 15, y);
        y += (lines.length * 4.5) + 2;
      });

      // Notes if exists
      if (quotation.notes && quotation.notes.trim()) {
        if (y > 230) {
          doc.addPage();
          y = 20;
        } else {
          y += 8;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('ADDITIONAL PROJECT NOTES', 15, y);
        
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        
        const lines = doc.splitTextToSize(quotation.notes, 175);
        doc.text(lines, 15, y);
      }

      // Save the PDF
      const filename = `Quotation_${quotation.clientName.replace(/\s+/g, '_')}_${quotation.id}.pdf`;
      doc.save(filename);
      onAddLog(`PDF_GENERATED: Downloaded quotation PDF for '${quotation.clientName}'.`);
    } catch (pdfErr) {
      console.error("Failed to generate PDF:", pdfErr);
      alert("Error generating PDF. Please check console.");
    }
  };

  // AI Cost Estimator States
  const [calculatorUrl, setCalculatorUrl] = useState('');
  const [calculatorNotes, setCalculatorNotes] = useState('');
  const [calculatorMarket, setCalculatorMarket] = useState<'US' | 'IN' | 'EU'>('US');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState('');
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [calculatorScanSuccess, setCalculatorScanSuccess] = useState<boolean | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const triggerCalculation = async () => {
    if (!calculatorUrl.trim()) return;
    setIsCalculating(true);
    setCalcError(null);
    setCalculationResult(null);
    setCalculatorScanSuccess(null);

    const steps = [
      "Initializing AI Spider bots...",
      "Resolving URL DNS & Ping responses...",
      "Parsing page layout nodes & structural CSS rules...",
      "Inspecting asset sizes & script loaders...",
      "Analyzing third-party integrations & payment gateways...",
      "Synthesizing high-fidelity pricing arrays..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setCalculationProgress(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const response = await fetch("/api/calculate-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: calculatorUrl, notes: calculatorNotes, market: calculatorMarket })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Estimation failed");
      }

      setCalculationResult(data.estimation);
      setCalculatorScanSuccess(data.scanSuccess);
      const symbol = data.estimation.currencySymbol || '$';
      onAddLog(`AI_ESTIMATOR_SUCCESS: Calculated pricing for ${calculatorUrl} (${symbol}${data.estimation.estimatedCostMin.toLocaleString()} - ${symbol}${data.estimation.estimatedCostMax.toLocaleString()}) (Scan: ${data.scanSuccess ? "Success" : "Bypassed"})`);
    } catch (err: any) {
      console.error(err);
      setCalcError(err.message || "Could not complete calculation. Please try again.");
      onAddLog(`AI_ESTIMATOR_ERROR: Calculation failed for ${calculatorUrl}`);
    } finally {
      setIsCalculating(false);
    }
  };

  const handlePopulateCatalog = (res: any) => {
    if (!res) return;
    const symbol = res.currencySymbol || '$';
    setNewProject({
      name: `${calculatorUrl.replace(/^(https?:\/\/)?(www\.)?/, '')} Rebuild`,
      client: calculatorUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('.')[0].toUpperCase() || 'Web Client',
      description: `A proposed high-performance modern redesign. Scope includes: ${res.keyFeaturesDetected?.slice(0, 4).join(', ') || 'Custom design and hosting'}. Recommended framework: ${res.architecture || 'Next.js'}.`,
      industry: 'Luxury Retail',
      role: 'Fullstack Dev & Designer',
      timeline: `${res.timelineWeeksMin}-${res.timelineWeeksMax} Weeks`,
      tagsString: res.techStack?.slice(0, 3).join(', ') || 'React, Tailwind',
      liveUrl: calculatorUrl,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      status: 'draft',
      challenge: `The client has a legacy platform at ${calculatorUrl} that suffers from design limitations and sluggish load speeds.`,
      solution: `Created a highly modern ${res.architecture} layout built with ${res.techStack?.slice(0, 3).join(', ')}. Engineered Stripe checkouts, high-contrast typography, and sub-second asset fetching.`,
      resultsStr1: `${symbol}${(res.estimatedCostMin / 1000).toFixed(0)}k`, resultsLbl1: 'Minimum Estimated Valuation',
      resultsStr2: `${res.timelineWeeksMin}w`, resultsLbl2: 'Estimated Initial Milestone',
      resultsStr3: res.complexity || 'Medium', resultsLbl3: 'Calculated Complexity Tier'
    });
    setShowAddProjectModal(true);
    onAddLog('AI_ESTIMATOR: Populated website analysis parameters into case-study wizard');
  };

  // Handle Authentication submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passcode.trim().toLowerCase();
    if (cleanPass === 'admin123' || cleanPass === 'webdot-admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('webdot_authenticated', 'true');
      onAddLog('SECURITY_ACCESS_GRANTED: Root admin authentication successful');
    } else {
      setLoginError(true);
      onAddLog('SECURITY_ALERT: Unauthorized login attempt detected with bad passcode');
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  // Quick Bypass Demo mode
  const handleQuickBypass = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('webdot_authenticated', 'true');
    onAddLog('SECURITY_ACCESS_GRANTED: Root admin logged in via demo quick bypass');
  };

  // Handle Command Console Submission
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    const cmd = consoleInput.trim();
    const cleanCmd = cmd.toLowerCase();
    
    // Append to local terminal input history
    setTerminalHistory(prev => [...prev, `admin@webdot:~$ ${cmd}`]);

    if (cleanCmd === '/help') {
      setTerminalHistory(prev => [
        ...prev,
        'Available Terminal Operations:',
        '  /help          - Show this operational diagnostic menu',
        '  /stats         - Print live metric counters and active leads info',
        '  /traffic       - Inject synthetic high-fidelity leads and hits',
        '  /catalog       - Open cases catalog item creator modal',
        '  /approve-all   - Bulk authorize all pending reviews in the queue',
        '  /approve-cases - Bulk authorize all client-submitted project studies',
        '  /leads         - List active scheduler inquiries directly',
        '  /clear         - Reset local console visual buffers'
      ]);
      onAddLog('TERMINAL_COMMAND: Executed help diagnostics');
    } else if (cleanCmd === '/stats') {
      setTerminalHistory(prev => [
        ...prev,
        `System Status:`,
        `  - Projects: ${projects.length} loaded (${projects.filter(p => p.status === 'published').length} active)`,
        `  - Leads recorded: ${inquiries.length}`,
        `  - Pending Reviews: ${testimonials.filter(t => t.status === 'pending').length}`,
        `  - Pending Projects: ${projects.filter(p => p.status === 'pending').length}`
      ]);
      onAddLog('TERMINAL_COMMAND: Queried system statistics');
    } else if (cleanCmd === '/traffic') {
      onTriggerMockTraffic();
      setTerminalHistory(prev => [...prev, '>> Injecting high-volume sample lead payload... SUCCESS.']);
    } else if (cleanCmd === '/catalog') {
      setShowAddProjectModal(true);
      setTerminalHistory(prev => [...prev, '>> Spawning Case Study Catalog wizard modal...']);
      onAddLog('TERMINAL_COMMAND: Triggered catalog wizard layout');
    } else if (cleanCmd === '/approve-all') {
      const pendings = testimonials.filter(t => t.status === 'pending');
      if (pendings.length === 0) {
        setTerminalHistory(prev => [...prev, '>> Operational Feed is already clear. No reviews to authorize.']);
      } else {
        pendings.forEach(t => onApproveTestimonial(t.id));
        setTerminalHistory(prev => [...prev, `>> Bulk approved ${pendings.length} pending client testimonials.`]);
      }
      onAddLog(`TERMINAL_COMMAND: Authorized bulk reviews action (${pendings.length} entries)`);
    } else if (cleanCmd === '/approve-cases') {
      const pendings = projects.filter(p => p.status === 'pending');
      if (pendings.length === 0) {
        setTerminalHistory(prev => [...prev, '>> Project queue is clean. No submitted case studies to authorize.']);
      } else {
        pendings.forEach(p => onApproveProject(p.id));
        setTerminalHistory(prev => [...prev, `>> Bulk approved ${pendings.length} client-submitted project case studies.`]);
      }
      onAddLog(`TERMINAL_COMMAND: Authorized bulk case-studies action (${pendings.length} entries)`);
    } else if (cleanCmd === '/leads') {
      if (inquiries.length === 0) {
        setTerminalHistory(prev => [...prev, '>> No inquiries currently recorded in system memory.']);
      } else {
        setTerminalHistory(prev => [
          ...prev,
          'Active inquiries list:',
          ...inquiries.map((inq, i) => `  [${i + 1}] ${inq.fullName} (${inq.email}) - Service: ${inq.service}`)
        ]);
      }
      onAddLog('TERMINAL_COMMAND: Queried database leads index');
    } else if (cleanCmd === '/clear') {
      setTerminalHistory([]);
      onAddLog('TERMINAL_COMMAND: Cleared console buffer');
    } else {
      setTerminalHistory(prev => [...prev, `bash: command not found: ${cmd}. Type /help for assistance.`]);
    }

    setConsoleInput('');
  };

  // Auto scroll terminal to bottom
  React.useEffect(() => {
    if (terminalBottomRef.current) {
      terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory, systemLogs]);

  const filteredProjects = projects.filter(p => {
    if (projectFilter === 'published') return p.status === 'published';
    if (projectFilter === 'draft') return p.status === 'draft';
    if (projectFilter === 'pending') return p.status === 'pending';
    return true;
  });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.client) return;

    const tags = newProject.tagsString
      ? newProject.tagsString.split(',').map(t => t.trim())
      : ['Custom Project'];

    const projectToAdd: Project = {
      id: newProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: newProject.name,
      client: newProject.client,
      description: newProject.description || 'Custom premium build engineered by WEBDot Studio.',
      industry: newProject.industry,
      role: newProject.role || 'Design & Development',
      timeline: newProject.timeline || '3 Months',
      tags: tags,
      liveUrl: newProject.liveUrl || 'https://webdot.agency',
      image: newProject.image,
      imageSource: newProject.imageSource,
      status: newProject.status,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      results: [
        { value: newProject.resultsStr1, label: newProject.resultsLbl1, colorClass: 'text-primary' },
        { value: newProject.resultsStr2, label: newProject.resultsLbl2, colorClass: 'text-secondary' },
        { value: newProject.resultsStr3, label: newProject.resultsLbl3, colorClass: 'text-tertiary' }
      ],
      details: {
        challenge: newProject.challenge || 'Understanding legacy system friction and user dropoff.',
        solution: newProject.solution || 'A custom glassmorphic React platform utilizing lightning-fast routes.',
        technologyStack: [
          { name: 'React 19', icon: 'deployed_code' },
          { name: 'Tailwind CSS', icon: 'palette' },
          { name: 'Node.js', icon: 'database' }
        ],
        screenshots: [
          { title: 'Main Dashboard', image: newProject.image }
        ],
        testimonial: {
          quote: 'Absolute lifesavers. Beautiful aesthetic paired with real performance.',
          author: newProject.client,
          role: 'Founder'
        }
      }
    };

    onAddProject(projectToAdd);
    setShowAddProjectModal(false);
    // Reset form
    setNewProject({
      name: '', client: '', description: '', industry: categories[0] || 'Luxury Real Estate', role: '', timeline: '', tagsString: '',
      liveUrl: 'https://webdot.agency',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      imageSource: 'screenshot',
      status: 'draft', challenge: '', solution: '',
      resultsStr1: '32%', resultsLbl1: 'Fuel efficiency',
      resultsStr2: '2.5s', resultsLbl2: 'Average latency',
      resultsStr3: '50k', resultsLbl3: 'Active requests'
    });
  };

  // Sparkline mini SVG drawer
  const drawSparkline = (points: number[]) => {
    const width = 120;
    const height = 40;
    const maxVal = Math.max(...points, 1);
    const step = width / (points.length - 1);
    const coords = points.map((p, i) => {
      const x = i * step;
      const y = height - (p / maxVal) * (height - 6) - 3;
      return `${x},${y}`;
    });
    return (
      <svg className="w-[120px] h-[40px] opacity-80" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke="#b4c5ff"
          strokeWidth="2.5"
          points={coords.join(' ')}
        />
      </svg>
    );
  };

  // Dynamic Weekly Performance chart generators
  const getSvgPathForSparkline = (points: number[]) => {
    if (!points || points.length === 0) return '';
    const width = 700;
    const height = 150;
    const maxVal = Math.max(...points, 1);
    const step = width / (points.length - 1);
    
    const coords = points.map((p, i) => {
      const x = i * step;
      // Scale y to leave padding
      const y = height - (p / maxVal) * (height - 40) - 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    
    return `M ${coords.join(' L ')}`;
  };

  const getSvgAreaPathForSparkline = (points: number[]) => {
    if (!points || points.length === 0) return '';
    const linePath = getSvgPathForSparkline(points);
    return `${linePath} L 700,150 L 0,150 Z`;
  };

  const renderCirclesForSparkline = (points: number[], color: string) => {
    if (!points || points.length === 0) return null;
    const width = 700;
    const height = 150;
    const maxVal = Math.max(...points, 1);
    const step = width / (points.length - 1);
    
    return points.map((p, i) => {
      const x = i * step;
      const y = height - (p / maxVal) * (height - 40) - 20;
      return (
        <circle 
          key={i} 
          cx={x.toFixed(1)} 
          cy={y.toFixed(1)} 
          r="4.5" 
          fill={color} 
          className="transition-all duration-300 hover:scale-150 hover:brightness-125" 
        />
      );
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="relative w-full min-h-screen bg-[#050816] pt-28 pb-16 flex items-center justify-center overflow-hidden">
        {/* Ambient background blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 glow-blob z-0 pointer-events-none"></div>
        <div className="absolute inset-0 grid-pattern opacity-40 z-0 pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md p-8 glass-card rounded-3xl border border-white/10 shadow-2xl space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-mono font-bold uppercase tracking-widest text-red-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              RESTRICTED ENTRY GATEWAY
            </div>
            <h2 className="font-display text-2xl font-extrabold text-on-surface tracking-tight">
              WEBDot Security Terminal
            </h2>
            <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
              Please enter credentials to unlock active command systems and catalog engines.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Terminal Passcode</label>
              <input 
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface text-center font-mono focus:outline-none focus:border-primary transition-all"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 font-mono text-center">
                ❌ AUTH_ERROR: Credentials rejected.
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-primary text-background font-bold py-3.5 rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-1.5"
            >
              <Terminal className="w-4 h-4" /> Unlock Console
            </button>
          </form>

          <div className="border-t border-white/5 pt-4 text-center space-y-3">
            <div className="text-[10px] text-on-surface-variant font-mono">
              Demo Access Hint: <span className="text-primary font-bold">admin123</span> or <span className="text-secondary font-bold">webdot-admin</span>
            </div>
            <button 
              onClick={handleQuickBypass}
              className="text-[11px] font-bold text-on-surface/60 hover:text-white underline transition-colors"
            >
              Or Use Instant Demo Bypass &rarr;
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-background pt-24 pb-16">
      
      {/* Grid Pattern Background overlay to look tech/brutalist */}
      <div className="absolute inset-0 grid-pattern opacity-60 z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-gutter space-y-12">
        
        {/* Header Block with triggerable operations */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold uppercase tracking-widest mb-1.5">
              <Terminal className="w-4 h-4 text-secondary" />
              SYSTEM PORTAL v4.12
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter">
              Agency Command Portal
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Active operational monitoring, testimonial orchestration queue, project catalogs, and real-time lead analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            {onLockPortal && (
              <button
                onClick={onLockPortal}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-5 py-3 rounded-xl font-bold text-xs transition-all active:scale-95"
                title="Immediately deauthorizes this browser and hides all Admin Portal entries from the navbar"
              >
                <EyeOff className="w-3.5 h-3.5" />
                Lock & Hide Portal
              </button>
            )}

            <button
              onClick={onTriggerMockTraffic}
              className="flex items-center gap-2 bg-secondary/15 hover:bg-secondary/25 border border-secondary/25 text-secondary px-5 py-3 rounded-xl font-bold text-xs transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              Inject Sample Lead & Traffic
            </button>
            
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="flex items-center gap-2 bg-primary-container text-on-primary-container hover:brightness-110 px-5 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg shadow-primary-container/15"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Catalog Item
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2.5 border-b border-white/5 pb-4">
          <button
            onClick={() => setActivePortalTab('operations')}
            className={`px-5 py-3 rounded-xl font-bold text-xs font-mono transition-all uppercase tracking-wider flex items-center gap-2 ${
              activePortalTab === 'operations' 
                ? 'bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/10 border border-primary/20' 
                : 'bg-white/5 border border-white/5 text-on-surface-variant hover:text-white hover:bg-white/10'
            }`}
          >
            <Activity className="w-4 h-4" />
            Command Operations
          </button>
          <button
            onClick={() => {
              setActivePortalTab('quotations');
              resetQuotationForm();
            }}
            className={`px-5 py-3 rounded-xl font-bold text-xs font-mono transition-all uppercase tracking-wider flex items-center gap-2 ${
              activePortalTab === 'quotations' 
                ? 'bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/10 border border-primary/20' 
                : 'bg-white/5 border border-white/5 text-on-surface-variant hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4 text-secondary" />
            Quotation Document Portal
          </button>
        </div>

        {activePortalTab === 'operations' ? (
          <>
            {/* METRICS ROW (4 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.id} className="glass-card p-6 rounded-2xl flex justify-between items-center relative overflow-hidden group">
              <div className="space-y-2">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold block">{stat.label}</span>
                <div className="font-display text-3xl font-extrabold text-on-surface flex items-baseline gap-2">
                  {stat.value}
                  <span className={`text-xs font-mono font-bold ${stat.status === 'growth' ? 'text-primary' : 'text-on-surface-variant/70'}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div>
                {drawSparkline(stat.sparkline)}
              </div>
            </div>
          ))}
        </div>

        {/* THE CORE ANALYTICS GRAPH SECTION */}
        <div className="glass-card p-8 rounded-3xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <h3 className="font-display text-lg font-bold text-on-surface">Weekly Strategic Performance & Lead Generation</h3>
              </div>
              <p className="text-xs text-on-surface-variant">Real-time performance tracking of incoming inquiries against historical SEO organic traffic vectors.</p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary"></span>
                <span className="text-on-surface-variant">Client Inquiries</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-secondary"></span>
                <span className="text-on-surface-variant">Mock Session Hits (x100)</span>
              </div>
            </div>
          </div>

          {/* CUSTOM STYLISH SVG GRAPH AREA */}
          <div className="w-full h-64 relative bg-background/50 rounded-2xl border border-white/5 p-4 flex flex-col justify-between overflow-hidden">
            {/* Grid background lines */}
            <div className="absolute inset-x-0 top-1/4 border-t border-white/5"></div>
            <div className="absolute inset-x-0 top-2/4 border-t border-white/5"></div>
            <div className="absolute inset-x-0 top-3/4 border-t border-white/5"></div>
            
            {/* SVG Visualizer */}
            <div className="w-full h-44 relative mt-4">
              {(() => {
                const leadStat = stats.find(s => s.id === 'leads');
                const visitorStat = stats.find(s => s.id === 'visitors');

                const leadSpark = leadStat ? leadStat.sparkline : [15, 5, 12, 8, 15, 5, 10];
                const visitorSpark = visitorStat ? visitorStat.sparkline : [18, 10, 15, 5, 12, 8, 15];

                return (
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 700 150">
                    {/* Area primary */}
                    <path
                      d={getSvgAreaPathForSparkline(leadSpark)}
                      fill="url(#primaryGrad)"
                      opacity="0.15"
                      className="transition-all duration-500"
                    />
                    {/* Area secondary */}
                    <path
                      d={getSvgAreaPathForSparkline(visitorSpark)}
                      fill="url(#secondaryGrad)"
                      opacity="0.1"
                      className="transition-all duration-500"
                    />

                    {/* Line primary */}
                    <path
                      d={getSvgPathForSparkline(leadSpark)}
                      fill="none"
                      stroke="#b4c5ff"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    
                    {/* Line secondary */}
                    <path
                      d={getSvgPathForSparkline(visitorSpark)}
                      fill="none"
                      stroke="#d2bbff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                      className="transition-all duration-500"
                    />

                    {/* Dot markers */}
                    {renderCirclesForSparkline(leadSpark, "#b4c5ff")}
                    {renderCirclesForSparkline(visitorSpark, "#d2bbff")}

                    <defs>
                      <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#b4c5ff" />
                        <stop offset="100%" stopColor="#b4c5ff" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="secondaryGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d2bbff" />
                        <stop offset="100%" stopColor="#d2bbff" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                );
              })()}
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[10px] font-mono text-on-surface-variant font-bold border-t border-white/5 pt-2">
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
              <span>SUN</span>
            </div>
          </div>
        </div>

        {/* BOTTOM HALF MODULES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Project catalogs (col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h2 className="font-display text-xl font-bold text-on-surface">Live Case-Study Catalogs</h2>
                <p className="text-xs text-on-surface-variant">Toggle display status or manage live projects dynamically on the landing grid.</p>
              </div>

              {/* Status table filter */}
              <div className="flex gap-1.5 bg-surface-container-low p-1 rounded-xl border border-white/5">
                {(['all', 'published', 'draft', 'pending'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setProjectFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all ${
                      projectFilter === f
                        ? 'bg-primary text-background'
                        : 'text-on-surface-variant hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects list */}
            <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02] text-xs uppercase tracking-widest text-on-surface-variant font-semibold">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Industry</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-on-surface">{p.name}</div>
                          <div className="text-xs text-on-surface-variant font-mono">{p.client}</div>
                        </td>
                        <td className="py-4 px-6 text-on-surface-variant text-xs font-medium">
                          {p.industry}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'published' 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : p.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-white/5 text-on-surface-variant border border-white/10'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'published' ? 'bg-primary' : p.status === 'pending' ? 'bg-amber-400' : 'bg-on-surface-variant/60'}`}></span>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.status === 'pending' ? (
                              <button
                                onClick={() => onApproveProject(p.id)}
                                title="Approve & Publish case study"
                                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary transition-all"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => onToggleProjectStatus(p.id)}
                                title={p.status === 'published' ? 'Draft case study' : 'Publish case study'}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-on-surface-variant hover:text-white transition-all"
                              >
                                {p.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteProject(p.id)}
                              title="Delete case study"
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Website Cost Estimator Card */}
            <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 border border-white/5 bg-surface-container-low mt-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <h3 className="font-display text-lg font-bold text-on-surface">AI Client Web Cost Estimator</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant">Analyze a live client website to generate accurate development estimates, complexity scores, and pitch points.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Target URL</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-3.5 w-4 h-4 text-on-surface-variant" />
                    <input 
                      type="text"
                      value={calculatorUrl}
                      onChange={(e) => setCalculatorUrl(e.target.value)}
                      placeholder="e.g. apple.com, striping.io, customclientsite.org"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all placeholder-on-surface-variant/40"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Additional Client Context / Tech Preferences</label>
                  <textarea 
                    rows={3}
                    value={calculatorNotes}
                    onChange={(e) => setCalculatorNotes(e.target.value)}
                    placeholder="e.g. Include custom checkout, support Stripe split routing, requires content management backend with headless Strapi..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary transition-all resize-none placeholder-on-surface-variant/40"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Target Regional Market Pricing</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { code: 'US', label: 'US / Global', desc: 'USD ($) • Premium US Rates', icon: '🇺🇸' },
                      { code: 'IN', label: 'Indian Domestic', desc: 'INR (₹) • Startup & Local Rates', icon: '🇮🇳' },
                      { code: 'EU', label: 'European Union', desc: 'EUR (€) • GDPR & high UX focus', icon: '🇪🇺' }
                    ].map((m) => (
                      <button
                        key={m.code}
                        type="button"
                        onClick={() => setCalculatorMarket(m.code as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-20 cursor-pointer ${
                          calculatorMarket === m.code
                            ? 'border-primary bg-primary/5 text-on-surface'
                            : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] text-on-surface-variant'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full gap-1">
                          <span className="text-xs font-bold leading-tight">{m.label}</span>
                          <span className="text-sm shrink-0">{m.icon}</span>
                        </div>
                        <span className="text-[10px] font-mono text-on-surface-variant opacity-85 leading-tight mt-1">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {calcError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-mono">
                    ⚠️ Error: {calcError}
                  </div>
                )}

                <button
                  type="button"
                  disabled={isCalculating || !calculatorUrl.trim()}
                  onClick={triggerCalculation}
                  className={`w-full font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isCalculating || !calculatorUrl.trim()
                      ? 'bg-white/5 text-on-surface-variant/50 border border-white/5 cursor-not-allowed'
                      : 'bg-primary text-background hover:brightness-110 active:scale-98 shadow-lg shadow-primary/15'
                  }`}
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{calculationProgress}</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Scan URL & Calculate Cost</span>
                    </>
                  )}
                </button>
              </div>

              {/* ESTIMATION RESULTS PANELS */}
              {calculationResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-4 border-t border-white/5"
                >
                  {/* Scan Status Badge Notification */}
                  {calculatorScanSuccess !== null && (
                    <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 border ${
                      calculatorScanSuccess 
                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' 
                        : 'bg-amber-500/5 border-amber-500/10 text-amber-400'
                    }`}>
                      <span className="text-sm shrink-0">{calculatorScanSuccess ? '🌐' : '💡'}</span>
                      <div className="space-y-0.5">
                        <div className="font-bold">
                          {calculatorScanSuccess ? 'Website Successfully Scanned' : 'AI Spec-Heuristic Engine Activated'}
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed opacity-90">
                          {calculatorScanSuccess 
                            ? 'Page nodes, structural frameworks, and DOM trees analyzed.' 
                            : 'Target URL offline or unresolvable. Pricing calculated via architectural heuristics.'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary/5 border border-primary/10 p-5 rounded-2xl">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-primary uppercase tracking-wider font-bold">Recommended Pricing Bracket ({calculationResult.currency || 'USD'})</span>
                      <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-on-surface flex items-baseline gap-1">
                        {calculationResult.currencySymbol || '$'}{calculationResult.estimatedCostMin?.toLocaleString()} 
                        <span className="text-sm font-normal text-on-surface-variant px-1">to</span> 
                        {calculationResult.currencySymbol || '$'}{calculationResult.estimatedCostMax?.toLocaleString()}
                      </h4>
                    </div>
                    <div className="text-left sm:text-right space-y-1">
                      <span className="text-[10px] font-mono text-secondary uppercase tracking-wider font-bold block">Production Timeline</span>
                      <span className="font-display text-lg font-bold text-on-surface">
                        {calculationResult.timelineWeeksMin} - {calculationResult.timelineWeeksMax} Weeks
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Activity className="w-3.5 h-3.5 text-secondary" />
                        <span className="font-mono text-[10px] uppercase font-bold">Complexity Matrix</span>
                      </div>
                      <div className="font-bold text-sm text-on-surface">{calculationResult.complexity}</div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Cpu className="w-3.5 h-3.5 text-primary" />
                        <span className="font-mono text-[10px] uppercase font-bold">Architecture Model</span>
                      </div>
                      <div className="font-bold text-sm text-on-surface">{calculationResult.architecture}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Detected Key Features</span>
                    <div className="flex flex-wrap gap-2">
                      {calculationResult.keyFeaturesDetected?.map((feature: string, idx: number) => (
                        <span key={`f-${idx}`} className="text-2xs font-mono text-on-surface-variant bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                          ✦ {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">Suggested Tech Stack</span>
                    <div className="flex flex-wrap gap-2">
                      {calculationResult.techStack?.map((tech: string, idx: number) => (
                        <span key={`t-${idx}`} className="text-2xs font-mono text-primary bg-primary/10 border border-primary/10 px-2.5 py-1 rounded-lg font-bold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold block">Detailed Effort Breakdown</span>
                    <div className="space-y-2.5">
                      {calculationResult.costBreakdown?.map((phase: any, idx: number) => (
                        <div key={`p-${idx}`} className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs gap-4">
                          <div className="space-y-0.5 max-w-md">
                            <div className="font-bold text-on-surface">{phase.category}</div>
                            <div className="text-[11px] text-on-surface-variant line-clamp-1">{phase.details}</div>
                          </div>
                          <div className="font-mono font-bold text-primary shrink-0">
                            {calculationResult.currencySymbol || '$'}{phase.cost?.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-wider font-bold block">Pitch Strategy & Negotiation Hooks</span>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {calculationResult.monetizationAdvice}
                    </p>
                  </div>

                  <div className="border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01]">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold block">Suggested Monthly Support SLA</span>
                      <div className="text-xs text-on-surface-variant font-medium">
                        Retainer coverage: <span className="text-on-surface font-semibold">{calculationResult.maintenanceModel?.servicesIncluded?.slice(0, 3).join(', ')}</span>
                      </div>
                    </div>
                    <div className="font-mono text-sm font-bold text-secondary text-right">
                      {calculationResult.currencySymbol || '$'}{calculationResult.maintenanceModel?.monthlyCost}/mo
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handlePopulateCatalog(calculationResult)}
                      className="w-full bg-primary/10 border border-primary/20 text-primary hover:brightness-110 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Export to Case Studies Draft Wizard</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* RIGHT: Operational feedback channels (col-span-5) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Case Studies Approval Queue */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Case-Study Approval Queue
                  </h3>
                  <p className="text-xs text-on-surface-variant">Review project/case study submissions from customers or clients.</p>
                </div>
              </div>

              <div className="space-y-4">
                {projects.filter(p => p.status === 'pending').length === 0 ? (
                  <div className="glass-card p-8 rounded-2xl text-center space-y-2 bg-surface-container-low border border-white/5">
                    <CheckCircle className="w-8 h-8 text-primary mx-auto mb-1 opacity-80" />
                    <p className="text-xs text-on-surface font-semibold">Project Queue Clear</p>
                    <p className="text-[10px] text-on-surface-variant">No client-submitted project studies are currently awaiting verification.</p>
                  </div>
                ) : (
                  projects.filter(p => p.status === 'pending').map((proj) => (
                    <motion.div 
                      key={proj.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card p-6 rounded-2xl space-y-4 border-l-2 border-l-primary bg-surface-container-low"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-semibold text-on-surface text-sm">{proj.name}</div>
                          <div className="text-xs text-on-surface-variant font-mono">By {proj.client} ({proj.industry})</div>
                        </div>
                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          {proj.timeline}
                        </span>
                      </div>
                      
                      <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                        {proj.description}
                      </p>

                      {proj.results && proj.results.length > 0 && (
                        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                          <span className="text-on-surface-variant">Metric:</span>
                          <span className="font-bold text-primary">{proj.results[0].value} <span className="text-on-surface-variant font-normal">({proj.results[0].label})</span></span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {proj.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] font-mono text-on-surface-variant bg-white/5 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                        <button
                          onClick={() => onApproveProject(proj.id)}
                          className="flex-1 bg-primary text-background font-bold py-2 rounded-xl text-2xs transition-all hover:brightness-110 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve & Publish
                        </button>
                        <button
                          onClick={() => onDeleteProject(proj.id)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold py-2 rounded-xl text-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Reject / Delete
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Testimonials Approval Queue */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
                    <Star className="w-5 h-5 text-secondary" />
                    Review Authorization Feed
                  </h3>
                  <p className="text-xs text-on-surface-variant">Review client testimonials. Approved ones move immediately to the landing page carousel.</p>
                </div>
              </div>

              <div className="space-y-4">
                {testimonials.filter(t => t.status === 'pending').length === 0 ? (
                  <div className="glass-card p-8 rounded-2xl text-center space-y-2 bg-surface-container-low">
                    <CheckCircle className="w-8 h-8 text-primary mx-auto mb-1 opacity-80" />
                    <p className="text-xs text-on-surface font-semibold">Queue Clear</p>
                    <p className="text-[10px] text-on-surface-variant">All submitted user feedback have been authorized or rejected.</p>
                  </div>
                ) : (
                  testimonials.filter(t => t.status === 'pending').map((test) => (
                    <motion.div 
                      key={test.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card p-6 rounded-2xl space-y-4 border-l-2 border-l-secondary"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold font-display text-sm">
                          {test.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-on-surface text-sm">{test.name}</div>
                          <div className="text-xs text-on-surface-variant font-mono">{test.company}</div>
                        </div>
                      </div>
                      <p className="text-xs text-on-surface-variant italic leading-relaxed">
                        "{test.text}"
                      </p>
                      
                      <div className="flex items-center gap-2.5 pt-2 border-t border-white/5">
                        <button
                          onClick={() => onApproveTestimonial(test.id)}
                          className="flex-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-bold py-2 rounded-xl text-2xs transition-all flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => onRejectTestimonial(test.id)}
                          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-on-surface-variant font-bold py-2 rounded-xl text-2xs transition-all flex items-center justify-center gap-1"
                        >
                          <Ban className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Inquiries Leads Stream */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
                  <Mail className="w-5 h-5 text-tertiary" />
                  Live Leads & Scheduler Requests
                </h3>
                <p className="text-xs text-on-surface-variant font-medium">Real-time repository of booked consulting calls and lead submissions.</p>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                {inquiries.length === 0 ? (
                  <div className="glass-card p-8 rounded-2xl text-center space-y-2 bg-surface-container-low">
                    <p className="text-xs text-on-surface-variant">No inquiries on record.</p>
                  </div>
                ) : (
                  inquiries.map((inq) => (
                    <motion.div 
                      key={inq.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass-card p-5 rounded-2xl space-y-3 relative group"
                    >
                      <button
                        onClick={() => onDeleteInquiry(inq.id)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-on-surface-variant hover:text-red-400 border border-transparent hover:border-red-500/15 opacity-0 group-hover:opacity-100 transition-all duration-300"
                        title="Mark inquiry handled"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase bg-tertiary/10 text-tertiary px-2 py-0.5 rounded border border-tertiary/10">
                          {inq.service}
                        </span>
                        <h4 className="font-bold text-on-surface text-sm pt-1">{inq.fullName}</h4>
                        <p className="text-xs text-on-surface-variant font-mono">{inq.email}</p>
                      </div>
                      
                      <p className="text-xs text-on-surface-variant leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                        {inq.message}
                      </p>

                      <div className="text-[10px] text-on-surface-variant/70 font-mono text-right">
                        Received: {inq.date}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Project Categories Manager */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">category</span>
                  Project Categories Manager
                </h3>
                <p className="text-xs text-on-surface-variant">Add, view, and purge categories used for filtering case-study catalogs dynamically.</p>
              </div>

              <div className="glass-card p-6 rounded-2xl bg-surface-container-low border border-white/5 space-y-4">
                {/* Add Category Form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="E.g. AI Logistics, Fintech"
                    value={panelNewCategoryName}
                    onChange={(e) => setPanelNewCategoryName(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const trimmed = panelNewCategoryName.trim();
                        if (trimmed && onAddCategory) {
                          await onAddCategory(trimmed);
                          setPanelNewCategoryName('');
                        }
                      }
                    }}
                    className="flex-1 bg-[#11131b] border border-white/10 rounded-xl px-4 py-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const trimmed = panelNewCategoryName.trim();
                      if (trimmed && onAddCategory) {
                        await onAddCategory(trimmed);
                        setPanelNewCategoryName('');
                      }
                    }}
                    className="bg-primary hover:brightness-110 text-background px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    Add
                  </button>
                </div>

                {/* List of categories with delete buttons */}
                <div className="flex flex-wrap gap-2 pt-1 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1 text-xs text-on-surface transition-all group/tag"
                    >
                      <span className="font-mono text-[11px] font-semibold text-on-surface-variant group-hover/tag:text-white transition-all">{cat}</span>
                      {onDeleteCategory && (
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(cat)}
                          className="text-on-surface-variant hover:text-red-400 p-0.5 rounded transition-all focus:outline-none cursor-pointer"
                          title={`Delete category: ${cat}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="text-xs text-on-surface-variant text-center w-full py-4 font-mono">
                      No categories registered in the database.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* INTERACTIVE CONSOLE TERMINAL MODULE */}
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-4 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-secondary" />
                <h3 className="font-display text-lg font-bold text-on-surface">Live Diagnostic Console & Command Line</h3>
              </div>
              <p className="text-xs text-on-surface-variant">Execute micro-terminal command lines or monitor system stdout events.</p>
            </div>
            
            {/* Control indicators */}
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/40"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/40"></span>
            </div>
          </div>

          <div className="bg-[#050811] border border-white/5 rounded-2xl p-5 font-mono text-xs text-green-400 space-y-2 h-72 overflow-y-auto custom-scrollbar flex flex-col justify-between">
            <div className="space-y-1.5">
              {/* Event Stream logs */}
              {systemLogs.map((log, idx) => (
                <div key={`sys-${idx}`} className="opacity-70 text-on-surface-variant">
                  {log}
                </div>
              ))}

              {/* Input Command executions */}
              {terminalHistory.map((hist, idx) => (
                <div key={`hist-${idx}`} className={hist.startsWith('admin@webdot') ? 'text-primary font-semibold' : 'text-green-300'}>
                  {hist}
                </div>
              ))}

              {/* Invisible anchor for scrolling */}
              <div ref={terminalBottomRef} />
            </div>

            {/* Prompt Line */}
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 pt-4 border-t border-white/5 mt-auto">
              <span className="text-primary font-bold">admin@webdot:~$</span>
              <input 
                type="text"
                value={consoleInput}
                onChange={(e) => setConsoleInput(e.target.value)}
                placeholder="Type /help for diagnostic commands list..."
                className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono text-xs focus:ring-0 placeholder-green-700"
                autoComplete="off"
                spellCheck="false"
              />
            </form>
          </div>
        </div>

      </>
    ) : (
      <div className="space-y-8 animate-fadeIn">
        {/* Header / Actions Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low p-6 rounded-2xl border border-white/5">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-bold text-on-surface flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Client Quotations Engine
            </h2>
            <p className="text-xs text-on-surface-variant">
              Generate customized, highly professional commercial proposals with integrated milestone structures and printable PDF outputs.
            </p>
          </div>
          {!isEditingQuotation && (
            <button
              onClick={() => {
                resetQuotationForm();
                setIsEditingQuotation(true);
              }}
              className="flex items-center gap-2 bg-primary text-background hover:brightness-110 px-5 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg shadow-primary/10 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Quotation
            </button>
          )}
        </div>

        {/* List state */}
        {!isEditingQuotation ? (
          <div className="space-y-6">
            {/* Quotations Table */}
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div className="font-display font-semibold text-sm text-on-surface">Registered Quotation Records</div>
                <span className="text-2xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 font-bold uppercase">
                  {quotations?.length || 0} Total Quotes
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-mono text-on-surface-variant font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Quote ID</th>
                      <th className="p-4">Client & Company</th>
                      <th className="p-4">Target Project</th>
                      <th className="p-4">Val Until</th>
                      <th className="p-4">Total Budget</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right pr-6">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {!quotations || quotations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-on-surface-variant font-mono text-xs">
                          <FileText className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-3" />
                          No commercial quotations registered. Click 'Create New Quotation' above to launch the builder wizard.
                        </td>
                      </tr>
                    ) : (
                      quotations.map((q) => (
                        <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 pl-6 font-mono font-semibold text-primary">{q.id}</td>
                          <td className="p-4">
                            <div className="font-semibold text-on-surface">{q.clientName}</div>
                            <div className="text-[10px] text-on-surface-variant font-mono">{q.clientCompany || 'Independent'}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-on-surface">{q.projectName}</div>
                          </td>
                          <td className="p-4 font-mono text-on-surface-variant">{q.validUntil}</td>
                          <td className="p-4 font-mono font-bold text-secondary">${q.totalAmount.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                              q.status === 'accepted' ? 'bg-primary/25 text-primary border border-primary/20' :
                              q.status === 'sent' ? 'bg-secondary/25 text-secondary border border-secondary/20 font-semibold' :
                              q.status === 'expired' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                              'bg-white/5 text-on-surface-variant border border-white/5'
                            }`}>
                              {q.status}
                            </span>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleDownloadQuotationPDF(q)}
                                className="p-2 rounded-xl bg-primary/10 border border-primary/10 text-primary hover:bg-primary/20 hover:text-white transition-all cursor-pointer"
                                title="Download PDF Document"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLoadQuotationForEdit(q)}
                                className="p-2 rounded-xl bg-white/5 border border-white/5 text-on-surface-variant hover:bg-white/15 hover:text-white transition-all cursor-pointer"
                                title="Edit Quotation"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {onDeleteQuotation && (
                                <button
                                  type="button"
                                  onClick={() => onDeleteQuotation(q.id)}
                                  className="p-2 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Builder Wizard */
          <form onSubmit={handleFormSubmitQuotation} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Form (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 bg-surface-container-low">
                
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div className="font-display font-bold text-lg text-on-surface">
                    {editingQuotationId ? `Edit Quotation Details (${editingQuotationId})` : 'New Quotation Builder Wizard'}
                  </div>
                  <button
                    type="button"
                    onClick={resetQuotationForm}
                    className="text-on-surface-variant hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Meta info block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs font-mono text-on-surface-variant uppercase tracking-wider font-bold">Client Contact Name</label>
                    <input
                      type="text"
                      required
                      value={quoteClientName}
                      onChange={(e) => setQuoteClientName(e.target.value)}
                      placeholder="E.g. Jennifer Lawrence"
                      className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-mono text-on-surface-variant uppercase tracking-wider font-bold">Client Company Name</label>
                    <input
                      type="text"
                      value={quoteClientCompany}
                      onChange={(e) => setQuoteClientCompany(e.target.value)}
                      placeholder="E.g. Zenith Realty Corp"
                      className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-mono text-on-surface-variant uppercase tracking-wider font-bold">Client Email Address</label>
                    <input
                      type="email"
                      value={quoteClientEmail}
                      onChange={(e) => setQuoteClientEmail(e.target.value)}
                      placeholder="E.g. jennifer@zenithrealty.com"
                      className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-mono text-on-surface-variant uppercase tracking-wider font-bold">Quotation Document Status</label>
                    <select
                      value={quoteStatus}
                      onChange={(e: any) => setQuoteStatus(e.target.value)}
                      className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="draft">Draft (Private)</option>
                      <option value="sent">Sent to Client</option>
                      <option value="accepted">Accepted / Approved</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-mono text-on-surface-variant uppercase tracking-wider font-bold">Target Project Name</label>
                  <input
                    type="text"
                    required
                    value={quoteProjectName}
                    onChange={(e) => setQuoteProjectName(e.target.value)}
                    placeholder="E.g. Next-Gen Immersive Real Estate Platform"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs font-mono text-on-surface-variant uppercase tracking-wider font-bold">Issue Date</label>
                    <input
                      type="date"
                      required
                      value={quoteDate}
                      onChange={(e) => setQuoteDate(e.target.value)}
                      className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-mono text-on-surface-variant uppercase tracking-wider font-bold">Offer Validity Expiry</label>
                    <input
                      type="date"
                      required
                      value={quoteValidUntil}
                      onChange={(e) => setQuoteValidUntil(e.target.value)}
                      className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-mono text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-primary" />
                      Project Scope Deliverables & Budget Breakdowns
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuoteItems(prev => [...prev, { description: 'New project scope deliverable description...', amount: 1500 }])}
                      className="text-2xs font-mono font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-1 rounded cursor-pointer"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {quoteItems.map((item, index) => (
                      <div key={index} className="flex gap-2.5 items-center bg-[#050811]/50 p-3 rounded-xl border border-white/5 animate-fadeIn">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuoteItems(prev => {
                              const c = [...prev];
                              c[index].description = val;
                              return c;
                            });
                          }}
                          placeholder="Deliverable details"
                          className="flex-1 bg-[#050811] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:border-primary focus:outline-none transition-all"
                        />
                        <div className="flex items-center gap-1 bg-[#050811] border border-white/10 rounded-xl px-3 py-2 w-32 shrink-0">
                          <span className="text-xs text-on-surface-variant font-mono">$</span>
                          <input
                            type="number"
                            required
                            min={0}
                            value={item.amount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setQuoteItems(prev => {
                                const c = [...prev];
                                c[index].amount = val;
                                return c;
                              });
                            }}
                            className="w-full bg-transparent border-none outline-none text-xs text-on-surface font-mono p-0 focus:ring-0"
                          />
                        </div>
                        {quoteItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuoteItems(prev => prev.filter((_, i) => i !== index))}
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-transparent transition-all shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Schedule Milestones */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-mono text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-secondary" />
                      Milestone Payment Schedule
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuoteMilestones(prev => [...prev, { label: 'New Milestone Delivery', percentage: 20, amount: 0, description: 'Due upon completion of this technical phase.' }])}
                      className="text-2xs font-mono font-bold text-secondary hover:underline flex items-center gap-1 bg-secondary/10 border border-secondary/20 px-2 py-1 rounded cursor-pointer"
                    >
                      + Add Milestone
                    </button>
                  </div>

                  {/* Percent total indicator */}
                  {(() => {
                    const sumPct = quoteMilestones.reduce((s, m) => s + (Number(m.percentage) || 0), 0);
                    return (
                      <div className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between border ${
                        sumPct === 100 
                          ? 'bg-primary/5 border-primary/20 text-primary' 
                          : 'bg-red-500/5 border-red-500/20 text-red-400'
                      }`}>
                        <span className="flex items-center gap-1">
                          <Percent className="w-4 h-4" />
                          Milestone Percentages Distribution Balance
                        </span>
                        <span>{sumPct}% / 100%</span>
                      </div>
                    );
                  })()}

                  <div className="space-y-4">
                    {quoteMilestones.map((m, index) => (
                      <div key={index} className="bg-[#050811]/40 p-4 rounded-xl border border-white/5 space-y-3 animate-fadeIn">
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            required
                            value={m.label}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuoteMilestones(prev => {
                                const c = [...prev];
                                c[index].label = val;
                                return c;
                              });
                            }}
                            placeholder="Milestone Phase Name (e.g. Commencement Retainer)"
                            className="flex-1 bg-[#050811] border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-on-surface font-semibold focus:border-primary focus:outline-none transition-all"
                          />
                          <div className="flex items-center gap-1 bg-[#050811] border border-white/10 rounded-xl px-3 py-1.5 w-24 shrink-0">
                            <input
                              type="number"
                              required
                              min={1}
                              max={100}
                              value={m.percentage}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setQuoteMilestones(prev => {
                                  const c = [...prev];
                                  c[index].percentage = val;
                                  return c;
                                });
                              }}
                              className="w-full bg-transparent border-none outline-none text-xs text-on-surface font-mono text-right p-0 focus:ring-0"
                            />
                            <span className="text-xs text-on-surface-variant font-mono">%</span>
                          </div>
                          <span className="text-xs font-mono font-bold text-secondary w-20 text-right shrink-0">
                            ${m.amount.toLocaleString()}
                          </span>
                          {quoteMilestones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setQuoteMilestones(prev => prev.filter((_, i) => i !== index))}
                              className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-transparent transition-all shrink-0 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          value={m.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuoteMilestones(prev => {
                              const c = [...prev];
                              c[index].description = val;
                              return c;
                            });
                          }}
                          placeholder="Describe structural criteria (e.g., clearance of retainer before kick-off)"
                          className="w-full bg-[#050811]/80 border border-white/5 rounded-lg px-3 py-1 text-xs text-on-surface-variant focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agency Terms & Conditions */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-mono text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Commercial Terms & Conditions
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuoteTerms(prev => [...prev, 'All commercial adjustments inside active cycles must be documented and signed in writing.'])}
                      className="text-2xs font-mono font-bold text-primary hover:underline flex items-center gap-1 bg-primary/10 border border-primary/20 px-2 py-1 rounded cursor-pointer"
                    >
                      + Add Term
                    </button>
                  </div>

                  <div className="space-y-2">
                    {quoteTerms.map((term, index) => (
                      <div key={index} className="flex gap-2.5 items-center bg-[#050811]/30 p-2.5 rounded-xl border border-white/5 animate-fadeIn">
                        <span className="text-xs font-mono text-primary font-bold">{index + 1}.</span>
                        <input
                          type="text"
                          required
                          value={term}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuoteTerms(prev => {
                              const c = [...prev];
                              c[index] = val;
                              return c;
                            });
                          }}
                          placeholder="Enter legal/operational condition"
                          className="flex-1 bg-[#050811] border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-on-surface-variant focus:border-primary focus:outline-none transition-all"
                        />
                        {quoteTerms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuoteTerms(prev => prev.filter((_, i) => i !== index))}
                            className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-transparent transition-all shrink-0 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extra Notes */}
                <div className="space-y-1 pt-4 border-t border-white/5">
                  <label className="text-2xs font-mono text-on-surface-variant uppercase tracking-wider font-bold">Additional Project Context Notes (Private or Public Contract Notes)</label>
                  <textarea
                    rows={3}
                    value={quoteNotes}
                    onChange={(e) => setQuoteNotes(e.target.value)}
                    placeholder="E.g., Any specialized server configurations, SLA warranty notes, custom integration credits..."
                    className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface resize-none focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={resetQuotationForm}
                    className="flex-1 bg-white/5 border border-white/10 text-on-surface font-bold py-3.5 rounded-xl text-xs hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Cancel & Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-background font-bold py-3.5 rounded-xl text-xs hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-primary/15"
                  >
                    {editingQuotationId ? 'Save & Update Quotation' : 'Finalize & Store Quotation'}
                  </button>
                </div>

              </div>
            </div>

            {/* Right Interactive Live-Preview (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              <div className="glass-card p-6 rounded-3xl border border-white/10 bg-white text-slate-800 space-y-6 shadow-2xl overflow-hidden relative">
                
                {/* Live Watermark Badge */}
                <div className="absolute top-0 right-0 bg-secondary px-3 py-1 text-[8px] font-mono font-bold text-background uppercase tracking-widest rounded-bl-xl shadow flex items-center gap-1">
                  <Sparkle className="w-2.5 h-2.5 animate-spin-slow" /> LIVE PREVIEW MATCHING PDF
                </div>

                {/* PDF Header Mock */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 pt-2">
                  <div>
                    <div className="bg-slate-900 text-white font-extrabold text-xs px-3 py-1 tracking-wider inline-block rounded mb-1">
                      WEBDOT
                    </div>
                    <div className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">CREATIVE TECH AGENCY</div>
                  </div>
                  <div className="text-right text-[8px] text-slate-500 space-y-0.5">
                    <div className="font-bold text-slate-800">WEBDOT CREATIVE AGENCY</div>
                    <div>hello@webdot.agency</div>
                    <div>https://webdot.agency</div>
                  </div>
                </div>

                {/* Quotation title */}
                <div className="space-y-1">
                  <div className="text-sm font-black text-slate-900 tracking-tight">PROJECT COMMERCIAL QUOTATION</div>
                  <div className="w-12 h-0.5 bg-blue-500"></div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 text-[9px] bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-[8px] tracking-wide uppercase">QUOTATION DETAILS</div>
                    <div className="text-slate-600 font-mono">ID: {editingQuotationId || 'QT-[MOCK_ID]'}</div>
                    <div className="text-slate-600">Issued: {quoteDate}</div>
                    <div className="text-slate-600">Valid: {quoteValidUntil}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-[8px] tracking-wide uppercase">PREPARED FOR CLIENT</div>
                    <div className="text-slate-800 font-semibold">{quoteClientName || 'Client Name'}</div>
                    <div className="text-slate-600">{quoteClientCompany || 'Company'}</div>
                    <div className="text-slate-500 font-mono text-[8px]">{quoteClientEmail || 'client@email.com'}</div>
                  </div>
                </div>

                {/* Target project name */}
                <div className="text-[10px] text-slate-900 font-bold leading-snug">
                  Target: <span className="text-blue-600 underline decoration-blue-200">{quoteProjectName || 'Project Target Scope Name'}</span>
                </div>

                {/* Table scope */}
                <div className="space-y-2">
                  <div className="bg-slate-900 text-white text-[8px] font-bold p-1.5 rounded flex justify-between tracking-wide">
                    <span>SCOPE DESCRIPTION</span>
                    <span className="pr-2">ESTIMATED COST (USD)</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-[9px]">
                    {quoteItems.map((item, idx) => (
                      <div key={idx} className="py-2 flex justify-between items-center text-slate-700">
                        <span className="line-clamp-1 pr-4">{item.description}</span>
                        <span className="font-mono font-semibold text-slate-900">${(Number(item.amount) || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-300 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-[10px]">TOTAL BUDGET</span>
                    <span className="font-mono font-bold text-blue-600 text-[11px]">${totalQuoteAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Milestones Schedule Mock */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="font-bold text-slate-900 text-[9px] tracking-wide uppercase">PAYMENT MILESTONES & SCHEDULE</div>
                  <div className="space-y-2 text-[8px]">
                    {quoteMilestones.map((milestone, idx) => {
                      const calculatedAmt = Math.round((totalQuoteAmount * (Number(milestone.percentage) || 0)) / 100);
                      return (
                        <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-100 space-y-0.5">
                          <div className="flex justify-between items-center text-slate-900 font-bold">
                            <span>{milestone.label || `Milestone Phase ${idx + 1}`} ({milestone.percentage}%)</span>
                            <span className="font-mono text-blue-600 text-[9px]">${calculatedAmt.toLocaleString()}</span>
                          </div>
                          <p className="text-slate-500 leading-normal text-[7.5px] italic">{milestone.description || 'Milestone clearance conditions details...'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Terms T&C Mock */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="font-bold text-slate-900 text-[9px] tracking-wide uppercase">COMMERCIAL TERMS & CONDITIONS</div>
                  <div className="space-y-1 text-[7.5px] text-slate-500 leading-normal font-sans">
                    {quoteTerms.map((term, idx) => (
                      <div key={idx} className="flex gap-1.5">
                        <span className="font-bold text-slate-700">{idx + 1}.</span>
                        <p>{term}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download trigger */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      const tempQuote: Quotation = {
                        id: editingQuotationId || 'QT-MOCK',
                        clientName: quoteClientName || 'Jane Doe',
                        clientCompany: quoteClientCompany || 'Zenith Corp',
                        clientEmail: quoteClientEmail || 'jane@zenith.com',
                        projectName: quoteProjectName || 'Modern Web Application Platform',
                        date: quoteDate,
                        validUntil: quoteValidUntil,
                        items: quoteItems,
                        paymentMilestones: quoteMilestones.map(m => ({
                          ...m,
                          amount: Math.round((totalQuoteAmount * (Number(m.percentage) || 0)) / 100)
                        })),
                        terms: quoteTerms,
                        totalAmount: totalQuoteAmount,
                        notes: quoteNotes,
                        status: quoteStatus
                      };
                      handleDownloadQuotationPDF(tempQuote);
                    }}
                    className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Instant Download Draft PDF</span>
                  </button>
                </div>

              </div>
            </div>

          </form>
        )}
      </div>
    )}

  </div>

      {/* CREATE / ADD CATALOG MODAL */}
      <AnimatePresence>
        {showAddProjectModal && (
          <div className="fixed inset-0 z-[100] bg-background/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-surface-container rounded-3xl border border-white/10 shadow-2xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-on-surface" />
              </button>

              <h2 className="font-display text-2xl font-bold text-on-surface mb-2">Create Case-Study Catalog</h2>
              <p className="text-xs text-on-surface-variant mb-6">Input client credentials, technology stacks, and custom diagnostic metrics to launch on the site.</p>

              <form onSubmit={handleCreateProject} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">Project Name</label>
                    <input 
                      type="text" 
                      value={newProject.name}
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                      placeholder="E.g. Lunar Launch"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">Client Name</label>
                    <input 
                      type="text" 
                      value={newProject.client}
                      onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                      placeholder="E.g. Lunar Corp"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-on-surface-variant">Client Description Summary</label>
                  <textarea 
                    rows={2}
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Brief description that displays on the cards grid..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">Industry Vertical</label>
                    <select 
                      value={showAdminNewCategoryInput ? "__new__" : newProject.industry}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__new__") {
                          setShowAdminNewCategoryInput(true);
                        } else {
                          setShowAdminNewCategoryInput(false);
                          setNewProject({...newProject, industry: val});
                        }
                      }}
                      className="w-full bg-surface-container-high border border-white/10 rounded-xl px-4 py-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__new__">+ Add New Category...</option>
                    </select>

                    {showAdminNewCategoryInput && (
                      <div className="mt-2 flex gap-2">
                        <input 
                          type="text"
                          placeholder="Category name"
                          value={adminNewCategoryName}
                          onChange={(e) => setAdminNewCategoryName(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const trimmed = adminNewCategoryName.trim();
                            if (trimmed && onAddCategory) {
                              await onAddCategory(trimmed);
                              setNewProject(prev => ({ ...prev, industry: trimmed }));
                              setShowAdminNewCategoryInput(false);
                              setAdminNewCategoryName('');
                            }
                          }}
                          className="bg-primary hover:brightness-110 text-on-primary px-3 py-1 rounded-xl text-[10px] font-bold transition-all"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">Studio Role</label>
                    <input 
                      type="text" 
                      value={newProject.role}
                      onChange={(e) => setNewProject({...newProject, role: e.target.value})}
                      placeholder="E.g. Fullstack Dev"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">Timeline</label>
                    <input 
                      type="text" 
                      value={newProject.timeline}
                      onChange={(e) => setNewProject({...newProject, timeline: e.target.value})}
                      placeholder="E.g. 3 Months"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs text-on-surface-variant">Image Source Option</label>
                    <select
                      value={newProject.imageSource}
                      onChange={(e) => setNewProject({...newProject, imageSource: e.target.value as 'screenshot' | 'custom'})}
                      className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all font-mono"
                    >
                      <option value="screenshot">Live Screenshot</option>
                      <option value="custom">Custom Banner Link</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs text-on-surface-variant">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={newProject.tagsString}
                      onChange={(e) => setNewProject({...newProject, tagsString: e.target.value})}
                      placeholder="E.g. App Dev, Case Study 2024"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs text-on-surface-variant">Banner Image Link</label>
                    <input 
                      type="text" 
                      value={newProject.image}
                      onChange={(e) => setNewProject({...newProject, image: e.target.value})}
                      placeholder={newProject.imageSource === 'screenshot' ? 'Calculated from Live URL...' : 'https://...'}
                      disabled={newProject.imageSource === 'screenshot'}
                      className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all ${
                        newProject.imageSource === 'screenshot' ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="text-xs text-on-surface-variant">Live Project URL</label>
                    <input 
                      type="text" 
                      value={newProject.liveUrl}
                      onChange={(e) => setNewProject({...newProject, liveUrl: e.target.value})}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-4">
                  <h4 className="text-xs uppercase tracking-widest text-primary font-bold">Metrics Visualizers</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-on-surface-variant">Metric 1</label>
                      <input 
                        type="text" 
                        value={newProject.resultsStr1}
                        onChange={(e) => setNewProject({...newProject, resultsStr1: e.target.value})}
                        placeholder="E.g. +140%"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-on-surface"
                      />
                      <input 
                        type="text" 
                        value={newProject.resultsLbl1}
                        onChange={(e) => setNewProject({...newProject, resultsLbl1: e.target.value})}
                        placeholder="Label"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-on-surface-variant mt-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-on-surface-variant">Metric 2</label>
                      <input 
                        type="text" 
                        value={newProject.resultsStr2}
                        onChange={(e) => setNewProject({...newProject, resultsStr2: e.target.value})}
                        placeholder="E.g. 1.2s"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-on-surface"
                      />
                      <input 
                        type="text" 
                        value={newProject.resultsLbl2}
                        onChange={(e) => setNewProject({...newProject, resultsLbl2: e.target.value})}
                        placeholder="Label"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-on-surface-variant mt-1"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-on-surface-variant">Metric 3</label>
                      <input 
                        type="text" 
                        value={newProject.resultsStr3}
                        onChange={(e) => setNewProject({...newProject, resultsStr3: e.target.value})}
                        placeholder="E.g. 1.5M"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-on-surface"
                      />
                      <input 
                        type="text" 
                        value={newProject.resultsLbl3}
                        onChange={(e) => setNewProject({...newProject, resultsLbl3: e.target.value})}
                        placeholder="Label"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-on-surface-variant mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">The Challenge narrative</label>
                    <textarea 
                      rows={3}
                      value={newProject.challenge}
                      onChange={(e) => setNewProject({...newProject, challenge: e.target.value})}
                      placeholder="Describe the client's initial business problem..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-on-surface resize-none"
                    ></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-on-surface-variant">The Solution narrative</label>
                    <textarea 
                      rows={3}
                      value={newProject.solution}
                      onChange={(e) => setNewProject({...newProject, solution: e.target.value})}
                      placeholder="Describe how WEBDot's implementation solved it..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-on-surface resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={() => setShowAddProjectModal(false)}
                    className="flex-1 bg-white/5 border border-white/10 text-on-surface font-bold py-3.5 rounded-xl text-xs hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-primary text-background font-bold py-3.5 rounded-xl text-xs hover:brightness-110 transition-all"
                  >
                    Create Catalog Item
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
