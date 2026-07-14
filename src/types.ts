export interface ProjectDetails {
  challenge: string;
  solution: string;
  technologyStack: { name: string; icon: string }[];
  screenshots: { title: string; image: string }[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  industry: string;
  role: string;
  timeline: string;
  tags: string[];
  liveUrl: string;
  image: string;
  imageSource?: 'screenshot' | 'custom';
  status: 'published' | 'draft' | 'pending';
  lastUpdated: string;
  results: {
    value: string;
    label: string;
    colorClass: string; // e.g. text-primary, text-secondary
  }[];
  details?: ProjectDetails;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  text: string;
  initials: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Inquiry {
  id: string;
  fullName: string;
  email: string;
  service: string;
  message: string;
  date: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  change: string;
  status: string;
  icon: string;
  sparkline: number[];
}
