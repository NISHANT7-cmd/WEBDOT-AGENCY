import { Project, Testimonial, Inquiry, StatItem } from './types';

export const initialProjects: Project[] = [
  {
    id: 'skyline-properties',
    name: 'Skyline Properties',
    client: 'Skyline Properties',
    description: 'A premium property listing platform with AI-driven valuation and immersive 3D tours.',
    industry: 'Luxury Real Estate',
    role: 'UX/UI Design, Fullstack Dev, AI Integration',
    timeline: '6 Months (Q3-Q4 2023)',
    tags: ['FinTech & Real Estate', 'Case Study 2024'],
    liveUrl: 'https://skyline.webdot.agency',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXr0VDeJslsyWWEBEUBFaahVeXhZ-kzcploID68ZdCSEIp2kwAkYxNw6p7mkqkWweWLgbwbTj-k4u3TI230iY-gT4hok_lW0I3PUB7uNOikc0ufcUaY7r9XXw2mFLVr05RHi9lz2DBr7DmAKxA_w_9VM-eAjdBmq5kTawlFWquzudywCIwn9_1QbXWGn1M2cu_CXe-bV9S4sAdpY0CR3bBeEJ3krbdieaAR2mbucaberWEUArt4TKO',
    status: 'published',
    lastUpdated: 'Oct 24, 2023',
    results: [
      { value: '+150%', label: 'Increase in qualified leads via AI chat', colorClass: 'text-primary' },
      { value: '4.2s', label: 'Average improvement in page load speed', colorClass: 'text-secondary' },
      { value: '2.5M', label: 'Search queries handled by OpenAI engine', colorClass: 'text-tertiary' }
    ],
    details: {
      challenge: 'Skyline Properties faced a fragmented user journey where potential buyers were overwhelmed by massive listings and static search filters. Their legacy platform suffered from slow performance on mobile devices, resulting in a 65% drop-off rate during property inquiries. They needed a high-performance, immersive digital experience that felt as premium as the properties they sell.',
      solution: 'We engineered a bespoke headless platform using Next.js, prioritizing lightning-fast transitions and a "Mobile-First Luxury" philosophy. We integrated an OpenAI-powered recommendation engine that analyzes user browsing patterns to suggest homes that match their lifestyle, not just their budget. The UI utilizes tonal stacking and glassmorphic layers to maintain a clean, unhurried aesthetic that allows high-resolution architectural imagery to shine.',
      technologyStack: [
        { name: 'Next.js 14', icon: 'deployed_code' },
        { name: 'Tailwind CSS', icon: 'palette' },
        { name: 'Supabase DB', icon: 'database' },
        { name: 'OpenAI API', icon: 'psychology' }
      ],
      screenshots: [
        { title: 'Listing Detail View', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNxOa24yxJ4OEd5WuXlE4HdyPAfI_XDLwtVcis0vkLbHYW8bEfCaLKhtfNjaW_VXZyKHoXr2Ly8-KoSw4yTuJ1-bnGMzZMoyw5PCh4P58k5c8av5b2HkWCB-XeuA4B4eGIprcnc7x2VmiBFD-FMBH-KVkhcxZQNWC6UgZvjb50Ljwe5LcS-q-38wSVpPUg8deT2uA3PW8f_Oe5XnjdIcHbT71nRwQflbwQR85zbU_-iJswl4OZjSgl' },
        { title: 'Intelligent Search Engine', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP1BMbIBjgu_IDtJUSDuES7-4HI97pBIiF817PobaHIMGh5yuiF3p9JrzCeR3UkgFcRrAVA8xR9BqeEjSyp0mcWSYfgSaKmKRBsEkO6V81qSnKK0RT4MRDDM9MQj3AHh5_apMk8nY5s0jPW5JZ05uks38H6lCkdMon-d6wUUOuLnBjwKQb1GmggG5XUzi6dy4yZjfCx4l9lgILpfctK6iHvT-o5K1WYTJKkAR5RL9n8GEMatONnFmy' }
      ],
      testimonial: {
        quote: "The WEBDot team didn't just build a website; they created a digital experience that reflects our brand's precision and legacy. Our conversion rates have never been higher.",
        author: 'Julian Vane',
        role: 'CEO of Skyline'
      }
    }
  },
  {
    id: 'mediflow-ai',
    name: 'MediFlow AI',
    client: 'MediFlow AI',
    description: 'A luxury medical dashboard interface showing patient data, health analytics, and AI-predicted outcomes.',
    industry: 'Healthcare Tech',
    role: 'Front-end Dev, UX Audit, Data Viz, OpenAI Integration',
    timeline: '4 Months (Q1 2024)',
    tags: ['Healthcare', 'Case Study 2024'],
    liveUrl: 'https://mediflow.webdot.agency',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8IbWK1KcrWyzPsHY-IRfWzsPF_oS-zCcRyA4-za9mAO34rzGsgHC5woG2-07sEBnB9wCL3YAlwDKhC8mzKLz3NOUWzDe2OZ9rod-IaWIxWphJ7mJcLsJ2xKbQ2qdQg18YxVI19ix4ZoVHLmXxRa9oM6yQIs8nhsAC_GQxB0lmrTkZrI4qwUszksmOrTuurKc6VqR2nnLb1SFhvqwcZGjeZk-AwbeWy-53hAL2UQ1K52_iHkEX70xd',
    status: 'draft',
    lastUpdated: 'Nov 02, 2023',
    results: [
      { value: '+92%', label: 'Accuracy in predictive healthcare routing', colorClass: 'text-primary' },
      { value: '1.8s', label: 'Avg query resolution for patient logs', colorClass: 'text-secondary' },
      { value: '120k', label: 'Monthly active professional consultations', colorClass: 'text-tertiary' }
    ],
    details: {
      challenge: 'Healthcare professionals struggled to navigate dense EHR structures, losing vital seconds. They needed a clean, secure, and lightning-fast clinical view.',
      solution: 'We implemented custom WebGL layers and frosted glass dashboard structures utilizing Framer Motion, enabling frictionless, responsive transitions for life-saving workflows.',
      technologyStack: [
        { name: 'React 18', icon: 'deployed_code' },
        { name: 'Tailwind CSS', icon: 'palette' },
        { name: 'GraphQL', icon: 'database' },
        { name: 'OpenAI API', icon: 'psychology' }
      ],
      screenshots: [
        { title: 'Listing Detail View', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8IbWK1KcrWyzPsHY-IRfWzsPF_oS-zCcRyA4-za9mAO34rzGsgHC5woG2-07sEBnB9wCL3YAlwDKhC8mzKLz3NOUWzDe2OZ9rod-IaWIxWphJ7mJcLsJ2xKbQ2qdQg18YxVI19ix4ZoVHLmXxRa9oM6yQIs8nhsAC_GQxB0lmrTkZrI4qwUszksmOrTuurKc6VqR2nnLb1SFhvqwcZGjeZk-AwbeWy-53hAL2UQ1K52_iHkEX70xd' },
        { title: 'Intelligent Search Engine', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP1BMbIBjgu_IDtJUSDuES7-4HI97pBIiF817PobaHIMGh5yuiF3p9JrzCeR3UkgFcRrAVA8xR9BqeEjSyp0mcWSYfgSaKmKRBsEkO6V81qSnKK0RT4MRDDM9MQj3AHh5_apMk8nY5s0jPW5JZ05uks38H6lCkdMon-d6wUUOuLnBjwKQb1GmggG5XUzi6dy4yZjfCx4l9lgILpfctK6iHvT-o5K1WYTJKkAR5RL9n8GEMatONnFmy' }
      ],
      testimonial: {
        quote: "This dashboard changed how our team responds in critical situations. WEBDot's attention to professional user flows is unmatched.",
        author: 'Dr. Evelyn Vance',
        role: 'Chief of Medicine at BioGrid'
      }
    }
  },
  {
    id: 'aura-streetwear',
    name: 'Aura Streetwear',
    client: 'Aura Streetwear',
    description: 'An elegant e-commerce landing page for a high-end streetwear brand. The design uses bold typography and asymmetric layouts.',
    industry: 'Luxury Retail',
    role: 'Fullstack Dev, Headless Shopify Integration, Stripe Checkout',
    timeline: '3 Months (Q2 2024)',
    tags: ['E-commerce', 'Case Study 2024'],
    liveUrl: 'https://aura.webdot.agency',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_g9swZHZKwVWsWbRkHVsTU75sUuHzo-HRmRzGTRwZDba_JQ2qD_lsBPKsJwe0cqmkByvYirJlh0jxVgf9dnhzymuHhpOqK9S-Qfql30Egu4i6YR78zaFM19kFgHe_Svef2m5kbiOrLk8Lkaovu8BPQ7T7h7rdORvaNdWYKq0ycWjvomYMKAQGU3mXzEWurNlVxRRbOAWXR8DXEoISm9ngOuAu5zFry_HQ-NC1J-uGZ1mz_lpJNUPF',
    status: 'published',
    lastUpdated: 'Sep 12, 2023',
    results: [
      { value: '+240%', label: 'Growth in mobile checkouts', colorClass: 'text-primary' },
      { value: '0.9s', label: 'Global content distribution speed', colorClass: 'text-secondary' },
      { value: '$1.2M', label: 'Sales recorded in first fortnight', colorClass: 'text-tertiary' }
    ],
    details: {
      challenge: 'The client suffered from high abandonment rates due to traditional multi-step forms and slow mobile product loading.',
      solution: 'We optimized asset serving through high-end edge CDN policies and built a single-pane slide-out purchase engine.',
      technologyStack: [
        { name: 'Shopify Hydrogen', icon: 'deployed_code' },
        { name: 'Tailwind CSS', icon: 'palette' },
        { name: 'PostgreSQL', icon: 'database' },
        { name: 'Stripe Checkout', icon: 'credit_card' }
      ],
      screenshots: [
        { title: 'Listing Detail View', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_g9swZHZKwVWsWbRkHVsTU75sUuHzo-HRmRzGTRwZDba_JQ2qD_lsBPKsJwe0cqmkByvYirJlh0jxVgf9dnhzymuHhpOqK9S-Qfql30Egu4i6YR78zaFM19kFgHe_Svef2m5kbiOrLk8Lkaovu8BPQ7T7h7rdORvaNdWYKq0ycWjvomYMKAQGU3mXzEWurNlVxRRbOAWXR8DXEoISm9ngOuAu5zFry_HQ-NC1J-uGZ1mz_lpJNUPF' },
        { title: 'Intelligent Search Engine', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP1BMbIBjgu_IDtJUSDuES7-4HI97pBIiF817PobaHIMGh5yuiF3p9JrzCeR3UkgFcRrAVA8xR9BqeEjSyp0mcWSYfgSaKmKRBsEkO6V81qSnKK0RT4MRDDM9MQj3AHh5_apMk8nY5s0jPW5JZ05uks38H6lCkdMon-d6wUUOuLnBjwKQb1GmggG5XUzi6dy4yZjfCx4l9lgILpfctK6iHvT-o5K1WYTJKkAR5RL9n8GEMatONnFmy' }
      ],
      testimonial: {
        quote: "This storefront captures the visceral feeling of our brand. The speed is absolutely breakneck.",
        author: 'Kaelen Drake',
        role: 'Creative Director'
      }
    }
  },
  {
    id: 'nexus-logix',
    name: 'Nexus Logix',
    client: 'Nexus Logix',
    description: 'Optimizing supply chains using real-time AI agents and predictive routing with complex logistics visualizations.',
    industry: 'AI Logistics',
    role: 'UI/UX, AI Agents Orchestration, D3 Map Visualization',
    timeline: '5 Months (Q4 2023)',
    tags: ['AI Logistics', 'Case Study 2023'],
    liveUrl: 'https://nexus.webdot.agency',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK5yJbdbFeOxPLzUOav4BnnFswyEZR5P7WXNGH8dGOlGGQD0ZjTDpeWA2p9lqyJI2pKBI8To6h3bTz-Df24VmINzNGCEbGFedHpn-vTWOZtwB2bk1-iYm8D_4HELSgMfuIxV9x-UcD1-D6i7PQk1YXqsjiUGNT7Q7fbyVAB1Q_ibdQZeoyN9S3Y8WHbJ2SjrLSn_AMLWGDabdBW9TWQ9MYBoTIbJugsBtf6DEIHFTzTy6jkG4dIX3X',
    status: 'published',
    lastUpdated: 'Oct 12, 2023',
    results: [
      { value: '32%', label: 'Reduction in fuel and route times', colorClass: 'text-primary' },
      { value: '4.8s', label: 'Avg computation overhead per update', colorClass: 'text-secondary' },
      { value: '400k', label: 'Global deliveries rerouted daily', colorClass: 'text-tertiary' }
    ],
    details: {
      challenge: 'Logistics fleets were plagued by unpredictable port delays, weather anomalies, and high dispatch latency.',
      solution: 'We engineered a dashboard linking real-time weather sensors to dynamic routing optimization AI pipelines.',
      technologyStack: [
        { name: 'Next.js 14', icon: 'deployed_code' },
        { name: 'Tailwind CSS', icon: 'palette' },
        { name: 'TimescaleDB', icon: 'database' },
        { name: 'LangChain', icon: 'psychology' }
      ],
      screenshots: [
        { title: 'Listing Detail View', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK5yJbdbFeOxPLzUOav4BnnFswyEZR5P7WXNGH8dGOlGGQD0ZjTDpeWA2p9lqyJI2pKBI8To6h3bTz-Df24VmINzNGCEbGFedHpn-vTWOZtwB2bk1-iYm8D_4HELSgMfuIxV9x-UcD1-D6i7PQk1YXqsjiUGNT7Q7fbyVAB1Q_ibdQZeoyN9S3Y8WHbJ2SjrLSn_AMLWGDabdBW9TWQ9MYBoTIbJugsBtf6DEIHFTzTy6jkG4dIX3X' },
        { title: 'Intelligent Search Engine', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP1BMbIBjgu_IDtJUSDuES7-4HI97pBIiF817PobaHIMGh5yuiF3p9JrzCeR3UkgFcRrAVA8xR9BqeEjSyp0mcWSYfgSaKmKRBsEkO6V81qSnKK0RT4MRDDM9MQj3AHh5_apMk8nY5s0jPW5JZ05uks38H6lCkdMon-d6wUUOuLnBjwKQb1GmggG5XUzi6dy4yZjfCx4l9lgILpfctK6iHvT-o5K1WYTJKkAR5RL9n8GEMatONnFmy' }
      ],
      testimonial: {
        quote: "This software gives us unprecedented operational clarity. The AI suggestions are consistently accurate.",
        author: 'Marcus Kross',
        role: 'Global Head of Logistics'
      }
    }
  },
  {
    id: 'nomad-voyage',
    name: 'Nomad Voyage',
    client: 'Nomad Voyage',
    description: 'A luxurious travel booking and itinerary generator built with Next.js and integrated with smart calendar APIs.',
    industry: 'Travel & Leisure',
    role: 'Fullstack Dev, Google Workspace APIs, Stripe Payments',
    timeline: '3 Months (Q4 2023)',
    tags: ['Travel & Leisure', 'Case Study 2023'],
    liveUrl: 'https://nomad.webdot.agency',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaLI9OQqg9BfOZjxiiHkEFxClaNT96e02afcmqO_kn_iLtpnLMsLyqra_X3UgcISiBAqPAYpctpED73QAOseJ-tdi6vk5w00g_GvGgWitk2iiUset0IEvtWgegsZtIswGtiWO-nxe-vDjOEHnlzDbDZ7LUSEQdWsARMWB8wLWBdmWhyDpuojDq4obSX7vsK3Fememf5-2lqpcWEthqYduw2iDwJ1Op1TFcdj_wjg-COnhvwIzipak5',
    status: 'published',
    lastUpdated: 'Oct 18, 2023',
    results: [
      { value: '+110%', label: 'Increase in user booking completions', colorClass: 'text-primary' },
      { value: '2.1s', label: 'Average server-side response overhead', colorClass: 'text-secondary' },
      { value: '30k', label: 'Custom dynamic itineraries generated', colorClass: 'text-tertiary' }
    ],
    details: {
      challenge: 'Users faced friction organizing travel details across platforms. Legacy itineraries did not adapt to real-world calendar conflicts.',
      solution: 'We coupled a headless travel search API with personalized booking suggestions to keep scheduling beautifully synced.',
      technologyStack: [
        { name: 'Next.js 14', icon: 'deployed_code' },
        { name: 'Tailwind CSS', icon: 'palette' },
        { name: 'Stripe API', icon: 'credit_card' },
        { name: 'Google Workspace', icon: 'psychology' }
      ],
      screenshots: [
        { title: 'Listing Detail View', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaLI9OQqg9BfOZjxiiHkEFxClaNT96e02afcmqO_kn_iLtpnLMsLyqra_X3UgcISiBAqPAYpctpED73QAOseJ-tdi6vk5w00g_GvGgWitk2iiUset0IEvtWgegsZtIswGtiWO-nxe-vDjOEHnlzDbDZ7LUSEQdWsARMWB8wLWBdmWhyDpuojDq4obSX7vsK3Fememf5-2lqpcWEthqYduw2iDwJ1Op1TFcdj_wjg-COnhvwIzipak5' },
        { title: 'Intelligent Search Engine', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP1BMbIBjgu_IDtJUSDuES7-4HI97pBIiF817PobaHIMGh5yuiF3p9JrzCeR3UkgFcRrAVA8xR9BqeEjSyp0mcWSYfgSaKmKRBsEkO6V81qSnKK0RT4MRDDM9MQj3AHh5_apMk8nY5s0jPW5JZ05uks38H6lCkdMon-d6wUUOuLnBjwKQb1GmggG5XUzi6dy4yZjfCx4l9lgILpfctK6iHvT-o5K1WYTJKkAR5RL9n8GEMatONnFmy' }
      ],
      testimonial: {
        quote: "This ecosystem elevates high-end travel coordination to an art form. Seamless payments and gorgeous UI.",
        author: 'Julian Vane',
        role: 'CEO of Skyline'
      }
    }
  }
];

export const initialTestimonials: Testimonial[] = [
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    company: 'Quantum Bio',
    text: "The design precision at WEBDot is truly unparalleled. They didn't just build a site; they built a digital experience that reflects our brand's DNA perfectly.",
    initials: 'SC',
    status: 'pending'
  },
  {
    id: 'james-miller',
    name: 'James Miller',
    company: 'Atlas Dynamics',
    text: 'Efficient, visionary, and technically sound. WEBDot transformed our legacy systems into a streamlined powerhouse in under three months.',
    initials: 'JM',
    status: 'pending'
  }
];

export const initialStats: StatItem[] = [
  {
    id: 'leads',
    label: 'Total Leads',
    value: '1,482',
    change: '+12% ↑',
    status: 'growth',
    icon: 'person_add',
    sparkline: [15, 5, 12, 8, 15, 5, 10]
  },
  {
    id: 'projects',
    label: 'Active Projects',
    value: '24',
    change: 'Stable',
    status: 'stable',
    icon: 'rocket_launch',
    sparkline: [10, 18, 10, 15, 5, 12, 10]
  },
  {
    id: 'visitors',
    label: 'Website Visitors',
    value: '8.4k',
    change: '+4% ↑',
    status: 'growth',
    icon: 'visibility',
    sparkline: [18, 10, 15, 5, 12, 8, 15]
  },
  {
    id: 'reviews',
    label: 'Approved Reviews',
    value: '128',
    change: '+85%',
    status: 'growth',
    icon: 'thumb_up',
    sparkline: [5, 15, 5, 10, 12, 8, 15]
  }
];

export const initialInquiries: Inquiry[] = [
  {
    id: 'inq-1',
    fullName: 'David Sterling',
    email: 'david@quantum.bio',
    service: 'Website Development',
    message: 'Looking to update our biotech corporate web interface with dynamic WebGL visuals and ultra-fast page transitions.',
    date: '2026-07-12'
  },
  {
    id: 'inq-2',
    fullName: 'Clara Oswald',
    email: 'clara@atlas.dyn',
    service: 'AI Automation',
    message: 'Need a custom LLM customer support assistant integrated directly into our SaaS dashboard.',
    date: '2026-07-11'
  }
];

export const initialCategories: string[] = [
  'Luxury Real Estate',
  'Healthcare Tech',
  'Luxury Retail',
  'AI Logistics',
  'Travel & Leisure'
];
