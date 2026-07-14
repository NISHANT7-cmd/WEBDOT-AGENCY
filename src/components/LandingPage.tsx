import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Check, Briefcase, Layers, Send, Star, User, Sparkles, AlertCircle, Quote, Phone, MessageSquare, Mail } from 'lucide-react';
// @ts-ignore
import webdotLogo from '../assets/images/web.jpg';
import { Project, Testimonial, Inquiry } from '../types';
import { resolveProjectImage } from '../utils/imageResolver';

interface LandingPageProps {
  projects: Project[];
  testimonials: Testimonial[];
  onSelectProject: (project: Project) => void;
  onSubmitInquiry: (inquiry: Omit<Inquiry, 'id' | 'date'>) => void;
  onSubmitTestimonial: (testimonial: Omit<Testimonial, 'id' | 'status' | 'initials'>) => void;
  onSubmitProject: (project: Omit<Project, 'id' | 'status' | 'lastUpdated'>) => void;
}

export default function LandingPage({
  projects,
  testimonials,
  onSelectProject,
  onSubmitInquiry,
  onSubmitTestimonial,
  onSubmitProject
}: LandingPageProps) {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'review' | 'project'>('review');

  const [inquiryForm, setInquiryForm] = useState({ fullName: '', email: '', service: 'Website Development', message: '' });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', company: '', text: '' });
  
  const [projectForm, setProjectForm] = useState({
    name: '',
    client: '',
    description: '',
    industry: 'Healthcare Tech',
    role: 'UX/UI Design & Development',
    timeline: '3 Months',
    tagsString: '',
    liveUrl: '',
    imageSource: 'screenshot' as 'screenshot' | 'custom',
    imagePreset: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXr0VDeJslsyWWEBEUBFaahVeXhZ-kzcploID68ZdCSEIp2kwAkYxNw6p7mkqkWweWLgbwbTj-k4u3TI230iY-gT4hok_lW0I3PUB7uNOikc0ufcUaY7r9XXw2mFLVr05RHi9lz2DBr7DmAKxA_w_9VM-eAjdBmq5kTawlFWquzudywCIwn9_1QbXWGn1M2cu_CXe-bV9S4sAdpY0CR3bBeEJ3krbdieaAR2mbucaberWEUArt4TKO',
    challenge: '',
    solution: '',
    metricValue: '+95%',
    metricLabel: 'User engagement speed improvement'
  });
  
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [testimonialSuccess, setTestimonialSuccess] = useState(false);
  const [projectSuccess, setProjectSuccess] = useState(false);

  // Available unique industry tags + All
  const tags = ['All', 'Luxury Real Estate', 'Healthcare Tech', 'Luxury Retail', 'AI Logistics', 'Travel & Leisure'];

  const filteredProjects = selectedTag === 'All'
    ? projects.filter(p => p.status === 'published')
    : projects.filter(p => p.status === 'published' && (p.industry === selectedTag || p.tags.includes(selectedTag)));

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryForm.fullName || !inquiryForm.email || !inquiryForm.message) return;
    onSubmitInquiry(inquiryForm);
    setInquiryForm({ fullName: '', email: '', service: 'Website Development', message: '' });
    setInquirySuccess(true);
    setTimeout(() => setInquirySuccess(false), 5000);
  };

  const handleTestimonialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialForm.name || !testimonialForm.company || !testimonialForm.text) return;
    onSubmitTestimonial(testimonialForm);
    setTestimonialForm({ name: '', company: '', text: '' });
    setTestimonialSuccess(true);
    setTimeout(() => setTestimonialSuccess(false), 5000);
  };

  const handleProjectFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name || !projectForm.client || !projectForm.description) return;
    
    // Parse tags safely
    const parsedTags = projectForm.tagsString
      ? projectForm.tagsString.split(',').map(t => t.trim()).filter(Boolean)
      : [projectForm.industry, 'Customer Collaboration'];

    onSubmitProject({
      name: projectForm.name,
      client: projectForm.client,
      description: projectForm.description,
      industry: projectForm.industry,
      role: projectForm.role,
      timeline: projectForm.timeline,
      tags: parsedTags,
      liveUrl: projectForm.liveUrl || '#',
      image: projectForm.imagePreset,
      imageSource: projectForm.imageSource,
      results: [
        {
          value: projectForm.metricValue || '+100%',
          label: projectForm.metricLabel || 'Performance Increase',
          colorClass: 'text-primary'
        }
      ],
      details: {
        challenge: projectForm.challenge || 'The company faced challenges in optimization, digital positioning, and visual consistency.',
        solution: projectForm.solution || 'We designed and engineered a custom platform to streamline workflows and boost responsiveness.',
        technologyStack: parsedTags.map((t, idx) => ({
          name: t,
          icon: idx % 2 === 0 ? 'deployed_code' : 'palette'
        })),
        screenshots: [
          { title: 'Project Overview', image: projectForm.imagePreset }
        ],
        testimonial: {
          quote: `Collaborating with WEBDot transformed our operations. The speed of execution was stellar!`,
          author: projectForm.client,
          role: 'Client Sponsor'
        }
      }
    });

    setProjectForm({
      name: '',
      client: '',
      description: '',
      industry: 'Healthcare Tech',
      role: 'UX/UI Design & Development',
      timeline: '3 Months',
      tagsString: '',
      liveUrl: '',
      imageSource: 'screenshot',
      imagePreset: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXr0VDeJslsyWWEBEUBFaahVeXhZ-kzcploID68ZdCSEIp2kwAkYxNw6p7mkqkWweWLgbwbTj-k4u3TI230iY-gT4hok_lW0I3PUB7uNOikc0ufcUaY7r9XXw2mFLVr05RHi9lz2DBr7DmAKxA_w_9VM-eAjdBmq5kTawlFWquzudywCIwn9_1QbXWGn1M2cu_CXe-bV9S4sAdpY0CR3bBeEJ3krbdieaAR2mbucaberWEUArt4TKO',
      challenge: '',
      solution: '',
      metricValue: '+95%',
      metricLabel: 'User engagement speed improvement'
    });
    setProjectSuccess(true);
    setTimeout(() => setProjectSuccess(false), 5000);
  };

  return (
    <div className="relative w-full overflow-hidden bg-background">
      
      {/* Background Animated Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/20 glow-blob"></div>
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-secondary/15 glow-blob"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-tertiary/10 glow-blob"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-gutter py-24 space-y-32">
        
        {/* HERO SECTION */}
        <section className="pt-12 pb-6 flex flex-col items-center text-center space-y-6 sm:space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-primary animate-pulse"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-secondary" />
            WEBDot Agency ✦ Precision Interfaces
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-on-surface leading-tight sm:leading-none max-w-5xl"
          >
            We craft digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#b4c5ff] via-[#d2bbff] to-[#ffb596]">ecosystems</span> that convert
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-on-surface-variant text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed px-2"
          >
            A high-end design and engineering studio delivering premium websites, cloud platforms, and active dashboards that feel incredibly fluid.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md sm:max-w-none pt-2"
          >
            <a 
              href="#work"
              className="w-full sm:w-auto bg-white text-background px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2"
            >
              Explore Cases <ArrowUpRight className="w-4 h-4" />
            </a>
            <a 
              href="#contact"
              className="w-full sm:w-auto bg-[#11131b]/80 border border-white/10 text-on-surface px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl font-bold text-xs sm:text-sm hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all flex items-center justify-center"
            >
              Start Project
            </a>
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="pt-12 sm:pt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-16 border-t border-white/5 w-full max-w-3xl"
          >
            <div>
              <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface">99.9%</div>
              <p className="text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider mt-1">Uptime SLA</p>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface">
                {projects.filter(p => p.status === 'published').length}
              </div>
              <p className="text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider mt-1">Client Networks</p>
            </div>
            <div>
              <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface">9.8/10</div>
              <p className="text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider mt-1">Satisfied Score</p>
            </div>
          </motion.div>
        </section>

        {/* WORK / PORTFOLIO GRID SECTION */}
        <section id="work" className="space-y-8 sm:space-y-12">
          <div className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
            <div className="space-y-3 flex flex-col items-center">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-on-surface tracking-tight text-center">
                Our Selected Works
              </h2>
              <p className="text-on-surface-variant max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed px-4 text-center">
                Discover the high-performing platforms and immersive interfaces we engineered for global scaleups and enterprises.
              </p>
            </div>
            
            {/* Tag Filter */}
            <div className="flex flex-wrap gap-2 justify-center max-w-full overflow-x-auto py-2 w-full px-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedTag === tag
                      ? 'bg-primary text-background border-primary'
                      : 'bg-white/5 text-on-surface-variant border-white/10 hover:border-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Project Cards (Bento-inspired Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {filteredProjects.map((project, idx) => {
              // We alter between large and regular sizes
              const isLarge = idx === 0 || idx === 3;
              const gridSpan = isLarge ? 'md:col-span-8' : 'md:col-span-4';
              
              return (
                <div 
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className={`${gridSpan} group cursor-pointer space-y-4`}
                >
                  <div className="relative aspect-[16/10] rounded-3xl overflow-hidden glass-card border border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10"></div>
                    <div 
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-[1200ms] ease-out"
                      style={{ backgroundImage: `url('${resolveProjectImage(project)}')` }}
                    ></div>
                    
                    {/* Corner badge to open Case Study */}
                    <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <div className="bg-white text-background p-3 rounded-full shadow-lg flex items-center justify-center">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end">
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                          {project.industry}
                        </span>
                        <h3 className="font-display text-xl md:text-2xl font-bold text-white group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                      </div>
                      <div className="text-white/50 text-xs font-mono">
                        {project.timeline}
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-2 space-y-1 text-center flex flex-col items-center">
                    <p className="text-on-surface text-sm font-medium line-clamp-1">{project.description}</p>
                    <div className="flex flex-wrap gap-2 pt-1 justify-center">
                      {project.tags.map(t => (
                        <span key={t} className="text-[10px] text-on-surface-variant font-mono bg-white/5 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section id="services" className="space-y-10 sm:space-y-16">
          <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface">
              Engineered Capabilities
            </h2>
            <p className="text-on-surface-variant text-xs sm:text-sm md:text-base px-4 leading-relaxed">
              We specialize in constructing ultra-precise digital experiences that bridge elegant visual storytelling with rugged backend infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="glass-card p-6 sm:p-10 rounded-3xl space-y-4 sm:space-y-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-on-surface">High-End Frontend</h3>
              <p className="text-on-surface-variant text-xs sm:text-sm md:text-base leading-relaxed">
                Responsive layouts, precise typographic hierarchies, bespoke interaction physics, and custom WebGL layouts configured using Next.js and Tailwind.
              </p>
              <div className="w-full flex justify-center">
                <ul className="space-y-2 text-xs sm:text-sm text-on-surface inline-flex flex-col items-start">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Next.js 14 and React 19</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Framer Motion Physics</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-primary shrink-0" /> Tailwind Utility Architecture</li>
                </ul>
              </div>
            </div>

            <div className="glass-card p-6 sm:p-10 rounded-3xl space-y-4 sm:space-y-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-on-surface">Durable Infrastructure</h3>
              <p className="text-on-surface-variant text-xs sm:text-sm md:text-base leading-relaxed">
                Blazing fast API routing, reliable server-side microservices, global multi-region databases, and headless e-commerce integrations.
              </p>
              <div className="w-full flex justify-center">
                <ul className="space-y-2 text-xs sm:text-sm text-on-surface inline-flex flex-col items-start">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-secondary shrink-0" /> Node.js & Express Bundles</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-secondary shrink-0" /> PostgreSQL & Firebase</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-secondary shrink-0" /> Serverless Edge Caching</li>
                </ul>
              </div>
            </div>

            <div className="glass-card p-6 sm:p-10 rounded-3xl space-y-4 sm:space-y-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-tertiary" />
              </div>
              <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-on-surface">AI & Intelligence</h3>
              <p className="text-on-surface-variant text-xs sm:text-sm md:text-base leading-relaxed">
                Smart recommendation models, neural semantic search engines, complex data visualizations, and automated dispatch and logistics pipelines.
              </p>
              <div className="w-full flex justify-center">
                <ul className="space-y-2 text-xs sm:text-sm text-on-surface inline-flex flex-col items-start">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-tertiary shrink-0" /> OpenAI & Gemini API Proxies</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-tertiary shrink-0" /> Custom D3 Data Analytics</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-tertiary shrink-0" /> Predictive Lead Strategy</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS & QUEUE SECTION */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center justify-items-center">
          <div className="lg:col-span-5 space-y-5 sm:space-y-6 flex flex-col items-center text-center w-full mx-auto">
            <div className="inline-block text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
              CLIENT TESTIMONIALS
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-on-surface tracking-tight text-center">
              What founders say about WEBDot.
            </h2>
            <p className="text-on-surface-variant text-xs sm:text-sm md:text-base leading-relaxed max-w-xl px-4 text-center">
              We focus on premium execution. Submit your own project feedback below; approved reviews appear dynamically on our landing page feed once authorized via the command panel!
            </p>

            {/* Dynamic Client Submission Portal - Tabs selector */}
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-2 w-full max-w-md">
              <button
                type="button"
                onClick={() => setActiveTab('review')}
                className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                  activeTab === 'review' ? 'bg-primary text-background' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Submit Review
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('project')}
                className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                  activeTab === 'project' ? 'bg-primary text-background' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Submit Project Study
              </button>
            </div>

            <div className="w-full max-w-md">
              {activeTab === 'review' ? (
                /* Testimonial Submission Form */
                <form onSubmit={handleTestimonialSubmit} className="glass-card p-5 sm:p-8 rounded-2xl space-y-4 text-left">
                  <h3 className="font-display text-sm sm:text-base font-bold text-on-surface">Submit a Review</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs text-on-surface-variant font-medium">Full Name</label>
                      <input 
                        type="text" 
                        value={testimonialForm.name}
                        onChange={(e) => setTestimonialForm({...testimonialForm, name: e.target.value})}
                        placeholder="E.g. Elon Mask"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] sm:text-xs text-on-surface-variant font-medium">Company Name</label>
                      <input 
                        type="text" 
                        value={testimonialForm.company}
                        onChange={(e) => setTestimonialForm({...testimonialForm, company: e.target.value})}
                        placeholder="E.g. Tesla Space"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs text-on-surface-variant font-medium">Review message</label>
                    <textarea 
                      rows={3}
                      value={testimonialForm.text}
                      onChange={(e) => setTestimonialForm({...testimonialForm, text: e.target.value})}
                      placeholder="Share your experience working with WEBDot..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                      required
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-white text-background rounded-xl font-bold py-2.5 sm:py-3 text-[11px] sm:text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Submit Feedback to Portal <Send className="w-3 h-3" />
                  </button>

                  {testimonialSuccess && (
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-secondary bg-secondary/10 border border-secondary/20 p-3 rounded-xl">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Review sent to Admin command queue for verification!</span>
                    </div>
                  )}
                </form>
              ) : (
                /* Project Submission Form */
                <form onSubmit={handleProjectFormSubmit} className="glass-card p-5 sm:p-8 rounded-2xl space-y-4 text-left">
                  <h3 className="font-display text-sm sm:text-base font-bold text-on-surface">Submit Your Case Study</h3>
                  <p className="text-[10px] sm:text-[11px] text-on-surface-variant leading-relaxed">
                    Partnered with us on a project? Co-publish your verified case study so it displays directly in our Selected Works catalog upon admin verification.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant font-semibold">Project Name</label>
                      <input 
                        type="text" 
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                        placeholder="E.g. Zenith Platform"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 sm:py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant font-semibold">Client Name</label>
                      <input 
                        type="text" 
                        value={projectForm.client}
                        onChange={(e) => setProjectForm({...projectForm, client: e.target.value})}
                        placeholder="E.g. Zenith Analytics"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 sm:py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant font-semibold">Industry Vertical</label>
                      <select
                        value={projectForm.industry}
                        onChange={(e) => setProjectForm({...projectForm, industry: e.target.value})}
                        className="w-full bg-[#11131b] border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                      >
                        <option value="Luxury Real Estate">Luxury Real Estate</option>
                        <option value="Healthcare Tech">Healthcare Tech</option>
                        <option value="Luxury Retail">Luxury Retail</option>
                        <option value="AI Logistics">AI Logistics</option>
                        <option value="Travel & Leisure">Travel & Leisure</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant font-semibold">Project Timeline</label>
                      <input 
                        type="text" 
                        value={projectForm.timeline}
                        onChange={(e) => setProjectForm({...projectForm, timeline: e.target.value})}
                        placeholder="E.g. 3 Months"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 sm:py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant font-semibold">Short Case Description</label>
                    <textarea 
                      rows={2}
                      value={projectForm.description}
                      onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                      placeholder="Enter a highly descriptive summary..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 sm:py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant font-semibold">Highlight Metric</label>
                      <input 
                        type="text" 
                        value={projectForm.metricValue}
                        onChange={(e) => setProjectForm({...projectForm, metricValue: e.target.value})}
                        placeholder="E.g. +95% or $1.2M"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 sm:py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant font-semibold">Metric Description</label>
                      <input 
                        type="text" 
                        value={projectForm.metricLabel}
                        onChange={(e) => setProjectForm({...projectForm, metricLabel: e.target.value})}
                        placeholder="E.g. User retention spike"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 sm:py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant font-semibold">Technologies (comma-separated)</label>
                    <input 
                      type="text" 
                      value={projectForm.tagsString}
                      onChange={(e) => setProjectForm({...projectForm, tagsString: e.target.value})}
                      placeholder="E.g. React, Tailwind CSS, Stripe, OpenAI"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 sm:py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant font-semibold">Live Website URL</label>
                    <input 
                      type="text" 
                      value={projectForm.liveUrl}
                      onChange={(e) => setProjectForm({...projectForm, liveUrl: e.target.value})}
                      placeholder="E.g. https://myproject.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 sm:py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant font-semibold">Image Source</label>
                      <select
                        value={projectForm.imageSource}
                        onChange={(e) => setProjectForm({...projectForm, imageSource: e.target.value as 'screenshot' | 'custom'})}
                        className="w-full bg-[#11131b] border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all font-mono text-[11px]"
                      >
                        <option value="screenshot">Import Live Website Screenshot</option>
                        <option value="custom">Use Cover Design Preset</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-mono tracking-wider text-on-surface-variant font-semibold">Cover Design Preset</label>
                      <select
                        value={projectForm.imagePreset}
                        onChange={(e) => setProjectForm({...projectForm, imagePreset: e.target.value})}
                        disabled={projectForm.imageSource === 'screenshot'}
                        className={`w-full bg-[#11131b] border border-white/10 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all font-mono text-[11px] ${
                          projectForm.imageSource === 'screenshot' ? 'opacity-40 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="https://lh3.googleusercontent.com/aida-public/AB6AXuCXr0VDeJslsyWWEBEUBFaahVeXhZ-kzcploID68ZdCSEIp2kwAkYxNw6p7mkqkWweWLgbwbTj-k4u3TI230iY-gT4hok_lW0I3PUB7uNOikc0ufcUaY7r9XXw2mFLVr05RHi9lz2DBr7DmAKxA_w_9VM-eAjdBmq5kTawlFWquzudywCIwn9_1QbXWGn1M2cu_CXe-bV9S4sAdpY0CR3bBeEJ3krbdieaAR2mbucaberWEUArt4TKO">Skyline Deep Blue Abstract</option>
                        <option value="https://lh3.googleusercontent.com/aida-public/AB6AXuC8IbWK1KcrWyzPsHY-IRfWzsPF_oS-zCcRyA4-za9mAO34rzGsgHC5woG2-07sEBnB9wCL3YAlwDKhC8mzKLz3NOUWzDe2OZ9rod-IaWIxWphJ7mJcLsJ2xKbQ2qdQg18YxVI19ix4ZoVHLmXxRa9oM6yQIs8nhsAC_GQxB0lmrTkZrI4qwUszksmOrTuurKc6VqR2nnLb1SFhvqwcZGjeZk-AwbeWy-53hAL2UQ1K52_iHkEX70xd">MediFlow Health Emerald Gradient</option>
                        <option value="https://lh3.googleusercontent.com/aida-public/AB6AXuC_g9swZHZKwVWsWbRkHVsTU75sUuHzo-HRmRzGTRwZDba_JQ2qD_lsBPKsJwe0cqmkByvYirJlh0jxVgf9dnhzymuHhpOqK9S-Qfql30Egu4i6YR78zaFM19kFgHe_Svef2m5kbiOrLk8Lkaovu8BPQ7T7h7rdORvaNdWYKq0ycWjvomYMKAQGU3mXzEWurNlVxRRbOAWXR8DXEoISm9ngOuAu5zFry_HQ-NC1J-uGZ1mz_lpJNUPF">Aura Luxury Amber Wave</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-primary text-background rounded-xl font-bold py-2.5 sm:py-3 text-[11px] sm:text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    Submit Case Study <Send className="w-3 h-3" />
                  </button>

                  {projectSuccess && (
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-primary bg-primary/10 border border-primary/20 p-3 rounded-xl">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Success! Case study sent to Admin command queue!</span>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 w-full">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary text-center">Dynamic Review Feed</h3>
            
            <div className="space-y-6">
              {testimonials.filter(t => t.status === 'approved').length === 0 ? (
                <div className="glass-card p-8 sm:p-12 rounded-3xl text-center space-y-4">
                  <AlertCircle className="w-10 h-10 text-on-surface-variant/40 mx-auto" />
                  <p className="text-on-surface-variant font-medium text-xs sm:text-sm">No approved public reviews in feed yet.</p>
                  <p className="text-[10px] sm:text-xs text-on-surface-variant/70">Go to Command Portal to approve submitted reviews and watch them render!</p>
                </div>
              ) : (
                testimonials.filter(t => t.status === 'approved').map((test) => (
                  <motion.div 
                    key={test.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 sm:space-y-6 relative flex flex-col items-center text-center"
                  >
                    <Quote className="absolute right-6 top-6 w-8 h-8 sm:w-12 sm:h-12 text-white/5 pointer-events-none" />
                    <p className="font-display text-sm sm:text-base md:text-lg text-on-surface leading-relaxed italic px-4 sm:px-6 text-center">
                      "{test.text}"
                    </p>
                    <div className="flex flex-col items-center gap-2 w-full justify-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-display font-bold text-sm sm:text-base shrink-0">
                        {test.initials}
                      </div>
                      <div className="text-center">
                        <h4 className="font-bold text-on-surface text-sm sm:text-base">{test.name}</h4>
                        <p className="text-on-surface-variant text-[10px] sm:text-xs font-medium">{test.company}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* CONTACT / INQUIRY SCHEDULER */}
        <section id="contact" className="glass-card rounded-3xl p-6 sm:p-10 md:p-16 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 glow-blob"></div>
          
          <div className="lg:col-span-5 space-y-5 sm:space-y-6 relative z-10 flex flex-col items-center text-center w-full mx-auto">
            <span className="text-[10px] sm:text-xs font-semibold bg-tertiary/10 text-tertiary px-3 py-1 rounded-full border border-tertiary/20">
              PROJECT CONSULTATION
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight text-center">
              Let's create something extraordinary
            </h2>
            <p className="text-on-surface-variant text-xs sm:text-sm md:text-base leading-relaxed max-w-xl text-center">
              Have a pipeline challenge or design vision? Book an appointment. All scheduler leads are dispatched instantly to our Command Center for review.
            </p>
            
            <div className="space-y-3 pt-2 text-xs sm:text-sm text-on-surface flex flex-col items-center w-full max-w-md mx-auto">
              <div className="flex items-center gap-3 justify-center text-center">
                <span className="w-7 h-7 sm:w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </span>
                <span>Response guaranteed within 12 hours.</span>
              </div>
              <div className="flex items-center gap-3 justify-center text-center">
                <span className="w-7 h-7 sm:w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </span>
                <span>Includes a bespoke UX Audit of your current site.</span>
              </div>
            </div>

            {/* Direct Instant Access Hub */}
            <div className="mt-6 pt-6 border-t border-white/10 space-y-4 w-full max-w-md mx-auto">
              <h4 className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-primary flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                Direct Hotlines & Instant Chat
              </h4>
              <p className="text-[11px] sm:text-xs text-on-surface-variant leading-relaxed text-center">
                Skip the scheduler form and connect with our design and development partners instantly:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 pt-2 w-full max-w-md mx-auto">
                <a 
                  href="https://wa.me/917620685718" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/30 p-3 rounded-2xl transition-all group active:scale-95 cursor-pointer text-center"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface group-hover:text-emerald-400 transition-colors">WhatsApp Support</div>
                    <div className="text-[10px] text-on-surface-variant font-mono">Chat now: +91 76206 85718</div>
                  </div>
                </a>

                <a 
                  href="mailto:nishantshewale69@gmail.com" 
                  className="flex items-center justify-center gap-3 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 hover:border-blue-500/30 p-3 rounded-2xl transition-all group active:scale-95 cursor-pointer text-center"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface group-hover:text-blue-400 transition-colors">Direct Email</div>
                    <div className="text-[10px] text-on-surface-variant font-mono text-ellipsis overflow-hidden">nishantshewale69@gmail.com</div>
                  </div>
                </a>

                <a 
                  href="tel:+917620685718" 
                  className="flex items-center justify-center gap-3 bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/30 p-3 rounded-2xl transition-all group active:scale-95 cursor-pointer text-center"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Voice Call</div>
                    <div className="text-[10px] text-on-surface-variant font-mono">Call direct: +91 76206 85718</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative z-10 w-full">
            <form onSubmit={handleInquirySubmit} className="space-y-4 sm:space-y-6 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] sm:text-xs text-on-surface-variant font-medium">Your Name</label>
                  <input 
                    type="text" 
                    value={inquiryForm.fullName}
                    onChange={(e) => setInquiryForm({...inquiryForm, fullName: e.target.value})}
                    placeholder="Julian Vane"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] sm:text-xs text-on-surface-variant font-medium">Your Email Address</label>
                  <input 
                    type="email" 
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm({...inquiryForm, email: e.target.value})}
                    placeholder="julian@skyline.properties"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] sm:text-xs text-on-surface-variant font-medium">Requested Service</label>
                <select 
                  value={inquiryForm.service}
                  onChange={(e) => setInquiryForm({...inquiryForm, service: e.target.value})}
                  className="w-full bg-[#11131b] border border-white/10 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                >
                  <option value="Website Development">Premium Frontend & Web Design</option>
                  <option value="AI Automation">AI Integration & Assistants</option>
                  <option value="Enterprise Dashboard">Interactive Custom Dashboard</option>
                  <option value="E-Commerce Ecosystem">Headless E-commerce & Stripe</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] sm:text-xs text-on-surface-variant font-medium">Project Scope & Details</label>
                <textarea 
                  rows={4}
                  value={inquiryForm.message}
                  onChange={(e) => setInquiryForm({...inquiryForm, message: e.target.value})}
                  placeholder="Tell us a bit about your timeline, goals, and desired aesthetic..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary transition-all resize-none"
                  required
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary-container text-on-primary-container rounded-2xl font-bold py-3.5 sm:py-4 text-xs sm:text-sm hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary-container/20 flex items-center justify-center gap-2"
              >
                Send Request to Command center <ArrowUpRight className="w-4 h-4" />
              </button>

              {inquirySuccess && (
                <div className="flex items-center gap-2 text-xs text-primary bg-primary/10 border border-primary/20 p-4 rounded-2xl">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Success! Inquiry dispatched securely to operational records. Check Command Portal leads list!</span>
                </div>
              )}
            </form>
          </div>
        </section>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/5 pt-24 pb-16 bg-[#06080d] relative overflow-hidden text-center">
        {/* Background decorative luxury glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-gutter relative z-10 space-y-12">
          
          {/* Main Footer Center Info Block */}
          <div className="flex flex-col items-center space-y-6 pb-12 border-b border-white/5">
            
            {/* Logo and Brand Name */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden flex items-center justify-center p-1 shadow-xl shadow-primary/15 border border-white/10 hover:scale-105 transition-transform duration-300">
                <img 
                  src={webdotLogo} 
                  alt="WEBDot Logo" 
                  className="w-full h-full object-contain select-none pointer-events-none" 
                />
              </div>
              <span className="text-2xl font-display font-black text-on-surface tracking-widest uppercase">WEBDot</span>
            </div>

            {/* Slogan */}
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl leading-relaxed text-center px-4">
              A premium design & engineering partner crafting precision digital ecosystems, luxury interfaces, and durable cloud applications designed to scale.
            </p>

            {/* Quick Navigation Rows */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              <a href="#work" className="hover:text-primary transition-colors">Portfolio</a>
              <span className="text-white/10 select-none">✦</span>
              <a href="#services" className="hover:text-primary transition-colors">Capabilities</a>
              <span className="text-white/10 select-none">✦</span>
              <a href="#about" className="hover:text-primary transition-colors">Testimonials</a>
              <span className="text-white/10 select-none">✦</span>
              <a href="#contact" className="hover:text-primary transition-colors">Consultation</a>
            </div>

            {/* Unified Direct Access Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
              <a 
                href="mailto:nishantshewale69@gmail.com" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all text-xs text-on-surface-variant hover:text-white"
              >
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>nishantshewale69@gmail.com</span>
              </a>
              <a 
                href="https://wa.me/917620685718" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all text-xs text-on-surface-variant hover:text-white"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>WhatsApp Live Chat</span>
              </a>
              <a 
                href="tel:+917620685718" 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all text-xs text-on-surface-variant hover:text-white"
              >
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>+91 76206 85718</span>
              </a>
            </div>

          </div>

          {/* Sub-Footer: Copyright and Back to Top */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-on-surface-variant">
            <div className="font-mono text-[10px] sm:text-xs">
              © 2026 WEBDot Inc. All rights reserved. Precision Engineering for Visionaries.
            </div>

            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group flex items-center gap-2 text-xs font-semibold tracking-wider text-on-surface-variant hover:text-primary transition-all duration-300 py-1.5 px-3 bg-white/5 border border-white/5 hover:border-white/10 rounded-xl active:scale-95 cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
