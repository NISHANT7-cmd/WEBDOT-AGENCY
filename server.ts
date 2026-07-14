import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initialProjects, initialTestimonials, initialInquiries } from "./src/initialData";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent Local Data Store file path
const DATA_STORE_PATH = path.join(process.cwd(), "webdot_data_store.json");

interface DataStore {
  projects: any[];
  testimonials: any[];
  inquiries: any[];
  visitors: number;
  weeklyPerformance: {
    traffic: number[];
    leads: number[];
  };
}

let store: DataStore = {
  projects: [],
  testimonials: [],
  inquiries: [],
  visitors: 8420,
  weeklyPerformance: {
    traffic: [180, 100, 150, 50, 120, 80, 150],
    leads: [15, 5, 12, 8, 15, 5, 10]
  }
};

function loadStore() {
  try {
    if (fs.existsSync(DATA_STORE_PATH)) {
      const content = fs.readFileSync(DATA_STORE_PATH, "utf-8");
      store = JSON.parse(content);
    } else {
      store = {
        projects: initialProjects,
        testimonials: initialTestimonials,
        inquiries: initialInquiries,
        visitors: 8420,
        weeklyPerformance: {
          traffic: [180, 100, 150, 50, 120, 80, 150],
          leads: [15, 5, 12, 8, 15, 5, 10]
        }
      };
      saveStore();
    }
  } catch (error) {
    console.error("Failed to load data store, using in-memory fallbacks:", error);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save data store:", error);
  }
}

// Initial storage load on server start
loadStore();

// API route to scan and calculate website cost
app.post("/api/calculate-cost", async (req, res) => {
  const { url, notes, market = "US" } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  let htmlContent = "";
  let scanSuccess = false;

  try {
    // Try to fetch the URL to scan it
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000);
    const fetchUrl = url.startsWith("http") ? url : `https://${url}`;
    
    const response = await fetch(fetchUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    clearTimeout(id);

    if (response.ok) {
      const fullText = await response.text();
      // Keep only first 8000 characters to prevent huge token consumption or hitting limits
      htmlContent = fullText.slice(0, 8000);
      scanSuccess = true;
    }
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    console.log(`[AI Estimator info] URL Scan offline/failed (${errorMsg}). Proceeding with AI estimation heuristics...`);
    // Continue anyway; Gemini can estimate based on URL domain/name and notes
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const marketNames: Record<string, string> = {
      "US": "United States / Global premium market",
      "IN": "Indian domestic IT & startup market",
      "EU": "European Union market (GDPR compliant, high UX focus)"
    };

    const prompt = `Analyze the following website details and optional page source snippet to estimate the professional development cost, effort, and architecture breakdown.
URL: ${url}
Scan Status: ${scanSuccess ? "SUCCESS" : "FAILED_OR_TIMED_OUT"}
Scanned HTML Content Snippet: ${htmlContent ? htmlContent : "None available"}
Additional Requirements/Notes: ${notes || "None provided"}
Target Client Market: ${marketNames[market] || "US Market"}`;

    const systemInstruction = `You are an elite enterprise software architect and digital agency pricing expert. 
Your job is to analyze website details (and any scanned page code) to estimate the complexity, professional production cost, development timeline, and strategic billing recommendations for the agency.

CRITICAL: Estimate all costs (development, breakdowns, retainers) in the target market's LOCAL CURRENCY and standard pricing scales:
- If market is "US", use US Dollar (USD, Symbol: $). Premium US/Global agency standard rates (e.g. $100-$250/hr).
- If market is "IN", use Indian Rupee (INR, Symbol: ₹). Indian domestic agency standard rates (e.g. competitive pricing scaled for Indian startups or enterprises).
- If market is "EU", use Euro (EUR, Symbol: €). European agency standard rates (high regulatory compliance, GDPR-focused, €80-€180/hr).

Provide localized monetization advices, ROI arguments, and maintenance services that resonate with clients in that region.
Return a structured pricing estimation breakdown in JSON format.`;

    const geminiRes = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "currency",
            "currencySymbol",
            "estimatedCostMin",
            "estimatedCostMax",
            "timelineWeeksMin",
            "timelineWeeksMax",
            "complexity",
            "architecture",
            "techStack",
            "costBreakdown",
            "keyFeaturesDetected",
            "monetizationAdvice",
            "maintenanceModel"
          ],
          properties: {
            currency: {
              type: Type.STRING,
              description: "Three-letter currency code (USD, INR, or EUR) corresponding to the target market"
            },
            currencySymbol: {
              type: Type.STRING,
              description: "Currency symbol ($, ₹, or €) corresponding to the target market"
            },
            estimatedCostMin: {
              type: Type.NUMBER,
              description: "Minimum estimated development cost in target currency"
            },
            estimatedCostMax: {
              type: Type.NUMBER,
              description: "Maximum estimated development cost in target currency"
            },
            timelineWeeksMin: {
              type: Type.NUMBER,
              description: "Minimum timeline in weeks"
            },
            timelineWeeksMax: {
              type: Type.NUMBER,
              description: "Maximum timeline in weeks"
            },
            complexity: {
              type: Type.STRING,
              description: "Website complexity level: e.g. Low, Medium, High, Enterprise"
            },
            architecture: {
              type: Type.STRING,
              description: "Recommended architectural model: e.g. Headless SPA, Server-Side Rendered (SSR), Multi-Page Static, E-Commerce Hybrid"
            },
            techStack: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Suggested tech stack libraries and frameworks (e.g. React, Next.js, Tailwind, PostgreSQL, Stripe, Strapi)"
            },
            costBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["category", "cost", "details"],
                properties: {
                  category: { type: Type.STRING, description: "Phase/Component name (e.g. UI/UX Design, Front-end Dev, Back-end API, Testing)" },
                  cost: { type: Type.NUMBER, description: "Estimated allocation cost in target currency" },
                  details: { type: Type.STRING, description: "Details about what this allocation includes" }
                }
              }
            },
            keyFeaturesDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key features analyzed/assumed (e.g. Booking System, User Authentication, High Fidelity Animations, Interactive Dashboard)"
            },
            monetizationAdvice: {
              type: Type.STRING,
              description: "Strategic advice on how the agency can pitch this to maximize their margin (value-based pricing hooks, ROI arguments tailored for that market)"
            },
            maintenanceModel: {
              type: Type.OBJECT,
              required: ["monthlyCost", "servicesIncluded"],
              properties: {
                monthlyCost: { type: Type.NUMBER, description: "Suggested recurring monthly retainer cost in target currency" },
                servicesIncluded: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Services included in retainer (e.g. Hosting, Security Updates, Content Edits, Priority Support)"
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(geminiRes.text?.trim() || "{}");
    res.json({ success: true, scanSuccess, estimation: parsedData });
  } catch (error: any) {
    console.error("Gemini estimation failed:", error);
    res.status(500).json({ error: error.message || "Cost estimation engine error" });
  }
});

// ==========================================
// REAL-TIME ADMIN DASHBOARD & DATA FLOW APIS
// ==========================================

// GET dashboard statistics (calculated dynamically based on real data in storage)
app.get("/api/dashboard/stats", (req, res) => {
  loadStore();
  
  const totalLeads = store.inquiries.length;
  const activeProjects = store.projects.filter(p => p.status === 'published').length;
  const approvedReviews = store.testimonials.filter(t => t.status === 'approved').length;
  const totalVisitors = store.visitors;

  const stats = [
    {
      id: 'leads',
      label: 'Total Leads',
      value: totalLeads.toLocaleString(),
      change: '+12% ↑',
      status: 'growth',
      icon: 'person_add',
      sparkline: store.weeklyPerformance.leads
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
      sparkline: store.weeklyPerformance.traffic
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
  
  res.json({ success: true, stats });
});

// GET real-time weekly strategic performance
app.get("/api/dashboard/performance", (req, res) => {
  loadStore();
  res.json({
    success: true,
    performance: {
      traffic: store.weeklyPerformance.traffic,
      leads: store.weeklyPerformance.leads
    }
  });
});

// POST real-time visitor page hit (ping)
app.post("/api/visitors/ping", (req, res) => {
  loadStore();
  store.visitors += 1;
  
  // Track this hit on current day of week (MON to SUN)
  const today = new Date().getDay(); // 0 is Sun, 1 is Mon, ...
  const index = today === 0 ? 6 : today - 1;
  store.weeklyPerformance.traffic[index] = (store.weeklyPerformance.traffic[index] || 0) + 1;
  
  saveStore();
  res.json({ success: true, visitors: store.visitors });
});

// POST simulate mock traffic/leads in real-time
app.post("/api/dashboard/simulate-traffic", (req, res) => {
  loadStore();
  
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

  store.inquiries.unshift(newInq);
  store.visitors += Math.floor(Math.random() * 85) + 15;
  
  // Increment active leads counts for today
  const today = new Date().getDay();
  const index = today === 0 ? 6 : today - 1;
  store.weeklyPerformance.leads[index] = (store.weeklyPerformance.leads[index] || 0) + 1;
  store.weeklyPerformance.traffic[index] = (store.weeklyPerformance.traffic[index] || 0) + 15;
  
  saveStore();
  res.json({ success: true, inquiry: newInq, visitors: store.visitors });
});

// INQUIRIES ENDPOINTS (Leads)
app.get("/api/inquiries", (req, res) => {
  loadStore();
  res.json({ success: true, inquiries: store.inquiries });
});

app.post("/api/inquiries", (req, res) => {
  loadStore();
  const { fullName, email, service, message } = req.body;
  if (!fullName || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const newInq = {
    id: `inq-${Date.now()}`,
    fullName,
    email,
    service: service || "General Consultation",
    message: message || "",
    date: new Date().toISOString().split('T')[0]
  };

  store.inquiries.unshift(newInq);
  
  const today = new Date().getDay();
  const index = today === 0 ? 6 : today - 1;
  store.weeklyPerformance.leads[index] = (store.weeklyPerformance.leads[index] || 0) + 1;

  saveStore();
  res.json({ success: true, inquiry: newInq });
});

app.delete("/api/inquiries/:id", (req, res) => {
  loadStore();
  const { id } = req.params;
  store.inquiries = store.inquiries.filter(i => i.id !== id);
  saveStore();
  res.json({ success: true });
});

// PROJECTS ENDPOINTS (Case Studies)
app.get("/api/projects", (req, res) => {
  loadStore();
  res.json({ success: true, projects: store.projects });
});

app.post("/api/projects", (req, res) => {
  loadStore();
  const newProj = req.body;
  if (!newProj.name || !newProj.client) {
    return res.status(400).json({ error: "Name and client are required" });
  }

  const project = {
    ...newProj,
    id: newProj.id || `proj-${Date.now()}`,
    status: newProj.status || "draft",
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  };

  store.projects.unshift(project);
  saveStore();
  res.json({ success: true, project });
});

app.put("/api/projects/:id", (req, res) => {
  loadStore();
  const { id } = req.params;
  const updates = req.body;

  store.projects = store.projects.map(p => {
    if (p.id === id) {
      return { ...p, ...updates };
    }
    return p;
  });

  saveStore();
  res.json({ success: true });
});

app.delete("/api/projects/:id", (req, res) => {
  loadStore();
  const { id } = req.params;
  store.projects = store.projects.filter(p => p.id !== id);
  saveStore();
  res.json({ success: true });
});

// TESTIMONIALS ENDPOINTS (Reviews)
app.get("/api/testimonials", (req, res) => {
  loadStore();
  res.json({ success: true, testimonials: store.testimonials });
});

app.post("/api/testimonials", (req, res) => {
  loadStore();
  const { name, company, text } = req.body;
  if (!name || !text) {
    return res.status(400).json({ error: "Name and text are required" });
  }

  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const newTest = {
    id: `test-${Date.now()}`,
    name,
    company: company || "Independent",
    text,
    initials: initials || "CL",
    status: "pending"
  };

  store.testimonials.unshift(newTest);
  saveStore();
  res.json({ success: true, testimonial: newTest });
});

app.put("/api/testimonials/:id", (req, res) => {
  loadStore();
  const { id } = req.params;
  const { status } = req.body;

  store.testimonials = store.testimonials.map(t => {
    if (t.id === id) {
      return { ...t, status };
    }
    return t;
  });

  saveStore();
  res.json({ success: true });
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
