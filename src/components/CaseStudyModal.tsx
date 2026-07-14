import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Layers, Palette, Database, Cpu, ChevronRight, MessageSquare, Clock, Search, HelpCircle } from 'lucide-react';
import { Project } from '../types';
import { resolveProjectImage } from '../utils/imageResolver';

interface CaseStudyModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function CaseStudyModal({ project, onClose }: CaseStudyModalProps) {
  if (!project) return null;

  const getSafeUrl = (url: string) => {
    if (!url || url === '#') return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
  };

  const getTechIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'deployed_code':
      case 'layers':
        return <Layers className="w-8 h-8 text-primary" />;
      case 'palette':
        return <Palette className="w-8 h-8 text-primary" />;
      case 'database':
        return <Database className="w-8 h-8 text-primary" />;
      case 'psychology':
      case 'cpu':
        return <Cpu className="w-8 h-8 text-primary" />;
      default:
        return <Layers className="w-8 h-8 text-primary" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-md flex items-center justify-center p-4 md:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-7xl h-full max-h-[90vh] glass-modal rounded-3xl overflow-y-auto shadow-2xl flex flex-col scroll-smooth custom-scrollbar"
        >
          {/* Close Action (Absolute) */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-[70] p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:rotate-90 transition-all duration-300 group"
          >
            <X className="w-5 h-5 text-on-surface" />
          </button>

          {/* Hero Header Section */}
          <div className="relative w-full aspect-[21/9] min-h-[350px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e16] via-[#0c0e16]/40 to-transparent z-10"></div>
            <div 
              className="w-full h-full bg-cover bg-center scale-105 transform hover:scale-100 transition-transform duration-[2000ms]"
              style={{ backgroundImage: `url('${resolveProjectImage(project)}')` }}
            ></div>
            <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
                  {project.industry}
                </span>
                <span className="bg-white/5 text-on-surface-variant px-3 py-1 rounded-full text-xs font-semibold border border-white/10">
                  Case Study 2024
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface mb-6 leading-tight max-w-4xl">
                {project.name} — Digital Ecosystem
              </h1>
              <div className="flex flex-wrap gap-4">
                <a 
                  href={getSafeUrl(project.liveUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:brightness-115 active:scale-95 transition-all shadow-lg shadow-primary-container/20"
                >
                  Visit Live Website 
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="px-6 md:px-12 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Overview & Metrics */}
            <div className="lg:col-span-4 space-y-12">
              
              {/* Quick Overview */}
              <div className="glass-card p-8 rounded-2xl space-y-6">
                <h3 className="font-display text-lg font-semibold uppercase tracking-widest text-primary border-b border-white/5 pb-4">
                  Project Meta
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <p className="text-on-surface-variant text-xs uppercase mb-1 font-medium tracking-wide">Industry</p>
                    <p className="text-on-surface text-base font-semibold">{project.industry}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs uppercase mb-1 font-medium tracking-wide">Our Role</p>
                    <p className="text-on-surface text-base font-semibold">{project.role}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-xs uppercase mb-1 font-medium tracking-wide">Timeline</p>
                    <p className="text-on-surface text-base font-semibold">{project.timeline}</p>
                  </div>
                </div>
              </div>

              {/* Business Results / Metrics */}
              <div className="space-y-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
                  Business Results
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {project.results.map((result, idx) => (
                    <div 
                      key={idx} 
                      className="glass-card p-6 rounded-2xl group hover:bg-primary/5 transition-all duration-500"
                    >
                      <div className="text-primary font-display text-4xl md:text-5xl font-bold mb-2 leading-none group-hover:scale-105 origin-left transition-transform duration-300 inline-block">
                        {result.value}
                      </div>
                      <p className="text-on-surface text-sm">{result.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Narrative & Tech */}
            <div className="lg:col-span-8 space-y-16">
              
              {/* Narrative Sections */}
              <div className="space-y-12">
                <section className="space-y-4">
                  <h2 className="font-display text-3xl font-bold text-on-surface">The Challenge</h2>
                  <p className="text-on-surface-variant text-lg leading-relaxed">
                    {project.details?.challenge || `${project.name} was facing major pipeline drop-off due to visual clutter, sluggish load times, and poor mobile accessibility, demanding an immediate technical and artistic overhaul.`}
                  </p>
                </section>
                
                <section className="space-y-4">
                  <h2 className="font-display text-3xl font-bold text-on-surface">The Solution</h2>
                  <p className="text-on-surface-variant text-lg leading-relaxed">
                    {project.details?.solution || `We designed and developed an immersive WebGL-powered headless platform prioritizing speed, elegant glassmorphic layering, and frictionless interactivity.`}
                  </p>
                </section>
              </div>

              {/* Tech Stack Grid */}
              <div className="space-y-8">
                <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
                  Core Technology Stack
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {project.details?.technologyStack.map((tech, idx) => (
                    <div 
                      key={idx}
                      className="glass-card p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 hover:border-primary/40 transition-colors cursor-default"
                    >
                      {getTechIcon(tech.icon)}
                      <span className="font-semibold text-sm text-on-surface">{tech.name}</span>
                    </div>
                  )) || (
                    <div className="glass-card p-6 rounded-xl text-center">Next.js, Tailwind, React</div>
                  )}
                </div>
              </div>

              {/* Screenshot Gallery */}
              {project.details?.screenshots && (
                <div className="space-y-8">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-primary">
                    Interface Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {project.details.screenshots.map((shot, idx) => (
                      <div 
                        key={idx}
                        className="group relative aspect-video rounded-2xl overflow-hidden bg-surface-container border border-white/5 cursor-pointer"
                      >
                        <div 
                          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                          style={{ backgroundImage: `url('${shot.image}')` }}
                        ></div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-semibold text-sm uppercase tracking-wider">{shot.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          </div>

          {/* Footer Quote / CTA */}
          <div className="mt-auto px-6 md:px-12 py-16 bg-surface-container-lowest border-t border-white/5 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              {project.details?.testimonial && (
                <>
                  <p className="font-display text-xl md:text-2xl text-on-surface italic leading-relaxed font-light">
                    "{project.details.testimonial.quote}"
                  </p>
                  <p className="text-primary font-semibold tracking-wider text-xs uppercase">
                    — {project.details.testimonial.author}, {project.details.testimonial.role}
                  </p>
                </>
              )}
              <div className="pt-8">
                <a 
                  href={getSafeUrl(project.liveUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-primary-container text-on-primary-container px-10 py-4 rounded-xl font-semibold text-base hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary-container/20"
                >
                  Launch Live Site
                </a>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
