import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  limit 
} from "firebase/firestore";
import { initialProjects, initialTestimonials, initialInquiries } from "./src/initialData";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Load custom Firebase applet configuration with robust environment and default fallback
let firebaseConfig: any;
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
if (fs.existsSync(firebaseConfigPath)) {
  try {
    firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
  } catch (err) {
    console.warn("Failed to parse firebase-applet-config.json:", err);
  }
}

if (!firebaseConfig) {
  firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "AIzaSyDAyubgdUSv1LB7bPoLyp1_SF8lMdhokpw",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0924323899.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0924323899",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0924323899.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "905605910102",
    appId: process.env.FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "1:905605910102:web:d9f0afcbffed5682ff75f7"
  };
}

// Initialize Firebase App via Web SDK to authenticate using the API key via Web APIs.
// This resolves the cross-project PERMISSION_DENIED issue of the Admin SDK.
const firebaseApp = initializeApp(firebaseConfig);
const clientDb = getFirestore(firebaseApp, "ai-studio-webdotagency-be7610f7-4b4d-40fb-95db-239c2619d8da");

// Client compatibility layer that implements the firebase-admin / Firestore collection-chaining style APIs used in routes
class CompatDocRef {
  constructor(private colPath: string, private docId: string) {}

  async get() {
    const d = doc(clientDb, this.colPath, this.docId);
    const snap = await getDoc(d);
    return {
      exists: snap.exists(),
      data: () => snap.data()
    };
  }

  async set(data: any, options?: { merge?: boolean }) {
    const d = doc(clientDb, this.colPath, this.docId);
    if (options?.merge) {
      await setDoc(d, data, { merge: true });
    } else {
      await setDoc(d, data);
    }
  }

  async delete() {
    const d = doc(clientDb, this.colPath, this.docId);
    await deleteDoc(d);
  }
}

class CompatQuery {
  constructor(private colPath: string, private limitCount?: number) {}

  async get() {
    const q = collection(clientDb, this.colPath);
    if (this.limitCount !== undefined) {
      const snap = await getDocs(query(q, limit(this.limitCount)));
      return this.wrapSnapshot(snap);
    } else {
      const snap = await getDocs(q);
      return this.wrapSnapshot(snap);
    }
  }

  private wrapSnapshot(snap: any) {
    return {
      empty: snap.empty,
      size: snap.size,
      docs: snap.docs.map((d: any) => ({
        id: d.id,
        exists: d.exists(),
        data: () => d.data()
      }))
    };
  }
}

class CompatCollection {
  constructor(private colPath: string) {}

  doc(docId: string) {
    return new CompatDocRef(this.colPath, docId);
  }

  limit(n: number) {
    return new CompatQuery(this.colPath, n);
  }

  async get() {
    return new CompatQuery(this.colPath).get();
  }
}

const db = {
  collection(colPath: string) {
    return new CompatCollection(colPath);
  }
};

// Helper to check and seed the database with initial template data
async function seedDatabaseIfNeeded() {
  try {
    const projectsSnapshot = await db.collection("projects").limit(1).get();
    if (projectsSnapshot.empty) {
      console.log("Firestore database is empty. Seeding initial agency data...");

      // Seed projects
      for (const proj of initialProjects) {
        await db.collection("projects").doc(proj.id).set(proj);
      }

      // Seed testimonials
      for (const test of initialTestimonials) {
        await db.collection("testimonials").doc(test.id).set(test);
      }

      // Seed inquiries
      for (const inq of initialInquiries) {
        await db.collection("inquiries").doc(inq.id).set(inq);
      }

      // Seed metrics
      await db.collection("metrics").doc("dashboard").set({
        visitors: 8420,
        weeklyPerformance: {
          traffic: [180, 100, 150, 50, 120, 80, 150],
          leads: [15, 5, 12, 8, 15, 5, 10]
        }
      });

      console.log("Firestore database successfully seeded with case studies and metrics!");
    } else {
      console.log("Firestore database contains existing records. Seeding skipped.");
    }

    // Seed categories if empty
    const categoriesSnapshot = await db.collection("categories").limit(1).get();
    if (categoriesSnapshot.empty) {
      console.log("Seeding default project categories...");
      const initialCats = [
        'Luxury Real Estate',
        'Healthcare Tech',
        'Luxury Retail',
        'AI Logistics',
        'Travel & Leisure'
      ];
      for (const cat of initialCats) {
        const id = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await db.collection("categories").doc(id).set({ id, name: cat });
      }
    }
  } catch (error) {
    console.error("Failed to seed Firestore:", error);
  }
}

// Trigger initial Firestore database seeding
seedDatabaseIfNeeded();

// Helper functions for Firestore metrics access
async function getDashboardMetrics() {
  try {
    const doc = await db.collection("metrics").doc("dashboard").get();
    if (doc.exists) {
      return doc.data() as any;
    }
  } catch (error) {
    console.error("Error fetching metrics from Firestore:", error);
  }
  return {
    visitors: 8420,
    weeklyPerformance: {
      traffic: [180, 100, 150, 50, 120, 80, 150],
      leads: [15, 5, 12, 8, 15, 5, 10]
    }
  };
}

async function updateDashboardMetrics(data: any) {
  try {
    await db.collection("metrics").doc("dashboard").set(data, { merge: true });
  } catch (error) {
    console.error("Error updating metrics in Firestore:", error);
  }
}

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

    const systemInstruction = `You are an elite digital agency Director of Pricing and Principal Software Architect.
Your task is to analyze website parameters and optional code to generate a HIGHLY REALISTIC, PROFESSIONAL digital agency pricing proposal.

DO NOT return freelance or low-ball rates (e.g. $500, $1000 for standard complex projects). Today's professional agency rates in 2026 are premium, accounting for end-to-end design, production engineering, QA, and deployment.

You MUST classify the project into one of the following 4 tiers and strictly adhere to today's standard pricing scales:

1. "Low Complexity" (Brochure websites, high-end portfolios, single-page landing pages, clean landing pages):
- US Market: $3,000 to $8,000 USD (Timeline: 2-4 Weeks. Retainer Support: $150-$350/mo)
- EU Market: €3,000 to €7,500 EUR (Timeline: 2-4 Weeks. Retainer Support: €150-€300/mo)
- Indian Market: ₹1,20,000 to ₹3,50,000 INR (Timeline: 2-4 Weeks. Retainer Support: ₹10,000-₹25,000/mo)

2. "Medium Complexity" (Standard multi-page business sites, integrated custom blogs, light custom e-commerce stores with single stripe checkouts, standard booking/scheduling websites):
- US Market: $10,000 to $25,000 USD (Timeline: 4-8 Weeks. Retainer Support: $400-$800/mo)
- EU Market: €9,000 to €22,000 EUR (Timeline: 4-8 Weeks. Retainer Support: €350-€750/mo)
- Indian Market: ₹4,00,000 to ₹10,00,000 INR (Timeline: 4-8 Weeks. Retainer Support: ₹25,000-₹60,000/mo)

3. "High Complexity" (Full headless e-commerce, custom customer portals, SaaS platforms with custom workflows, multi-role dashboard applications, heavy API integrations, custom databases):
- US Market: $30,000 to $60,000 USD (Timeline: 8-14 Weeks. Retainer Support: $1,000-$2,500/mo)
- EU Market: €25,000 to €55,000 EUR (Timeline: 8-14 Weeks. Retainer Support: €900-€2,000/mo)
- Indian Market: ₹12,00,000 to ₹25,00,000 INR (Timeline: 8-14 Weeks. Retainer Support: ₹60,000-₹1,50,000/mo)

4. "Enterprise Complexity" (Massive legacy migrations, custom enterprise marketplaces, highly secure health/finance platforms, bespoke high-traffic distributed applications):
- US Market: $75,000 to $150,000+ USD (Timeline: 12-24+ Weeks. Retainer Support: $3,000-$7,500/mo)
- EU Market: €65,000 to €135,000+ EUR (Timeline: 12-24+ Weeks. Retainer Support: €2,500-€6,500/mo)
- Indian Market: ₹30,00,000 to ₹80,00,000+ INR (Timeline: 12-24+ Weeks. Retainer Support: ₹1,50,000-₹4,00,000/mo)

Ensure complexity parameter is one of: "Low", "Medium", "High", "Enterprise" (matching the Tier you select).
All internal breakdowns (costBreakdown array categories e.g. UI/UX Design, Front-end Dev, Back-end API, Testing, Project Management) MUST sum up exactly to a value between estimatedCostMin and estimatedCostMax.
Ensure standard currency symbols ($, €, ₹) and standard codes (USD, EUR, INR) are used according to the regional market selected.
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

    let parsedData: any = {};
    const textContent = geminiRes.text?.trim();
    if (textContent) {
      let cleanText = textContent;
      if (cleanText.startsWith("```")) {
        const lines = cleanText.split("\n");
        if (lines[0].startsWith("```json") || lines[0].startsWith("```")) {
          lines.shift();
        }
        if (lines[lines.length - 1].startsWith("```")) {
          lines.pop();
        }
        cleanText = lines.join("\n").trim();
      }
      try {
        parsedData = JSON.parse(cleanText);
      } catch (parseErr) {
        console.error("Failed to parse clean JSON, attempting regex extraction:", parseErr);
        const match = cleanText.match(/\{[\s\S]*\}/);
        if (match) {
          parsedData = JSON.parse(match[0]);
        } else {
          throw parseErr;
        }
      }
    }
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
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const inquiriesSnap = await db.collection("inquiries").get();
    const projectsSnap = await db.collection("projects").get();
    const testimonialsSnap = await db.collection("testimonials").get();
    const metrics = await getDashboardMetrics();

    const totalLeads = inquiriesSnap.size;
    const activeProjects = projectsSnap.docs.filter(doc => doc.data().status === 'published').length;
    const approvedReviews = testimonialsSnap.docs.filter(doc => doc.data().status === 'approved').length;
    const totalVisitors = metrics.visitors;

    const stats = [
      {
        id: 'leads',
        label: 'Total Leads',
        value: totalLeads.toLocaleString(),
        change: '+12% ↑',
        status: 'growth',
        icon: 'person_add',
        sparkline: metrics.weeklyPerformance.leads
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
        sparkline: metrics.weeklyPerformance.traffic
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
  } catch (error: any) {
    console.error("Failed to compile dashboard stats:", error);
    res.status(500).json({ error: error.message || "Database fetch error" });
  }
});

// GET real-time weekly strategic performance
app.get("/api/dashboard/performance", async (req, res) => {
  try {
    const metrics = await getDashboardMetrics();
    res.json({
      success: true,
      performance: {
        traffic: metrics.weeklyPerformance.traffic,
        leads: metrics.weeklyPerformance.leads
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST real-time visitor page hit (ping)
app.post("/api/visitors/ping", async (req, res) => {
  try {
    const metrics = await getDashboardMetrics();
    metrics.visitors += 1;

    // Track this hit on current day of week (MON to SUN)
    const today = new Date().getDay(); // 0 is Sun, 1 is Mon, ...
    const index = today === 0 ? 6 : today - 1;
    metrics.weeklyPerformance.traffic[index] = (metrics.weeklyPerformance.traffic[index] || 0) + 1;

    await updateDashboardMetrics(metrics);
    res.json({ success: true, visitors: metrics.visitors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST simulate mock traffic/leads in real-time
app.post("/api/dashboard/simulate-traffic", async (req, res) => {
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

    // Save newly generated inquiry to Firestore
    await db.collection("inquiries").doc(newInq.id).set(newInq);

    const metrics = await getDashboardMetrics();
    metrics.visitors += Math.floor(Math.random() * 85) + 15;

    // Increment active leads counts for today
    const today = new Date().getDay();
    const index = today === 0 ? 6 : today - 1;
    metrics.weeklyPerformance.leads[index] = (metrics.weeklyPerformance.leads[index] || 0) + 1;
    metrics.weeklyPerformance.traffic[index] = (metrics.weeklyPerformance.traffic[index] || 0) + 15;

    await updateDashboardMetrics(metrics);
    res.json({ success: true, inquiry: newInq, visitors: metrics.visitors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// INQUIRIES ENDPOINTS (Leads)
app.get("/api/inquiries", async (req, res) => {
  try {
    const snap = await db.collection("inquiries").get();
    const inquiries = snap.docs.map(doc => doc.data());
    // Sort descending by id/date timestamp
    inquiries.sort((a: any, b: any) => b.id.localeCompare(a.id));
    res.json({ success: true, inquiries });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/inquiries", async (req, res) => {
  try {
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

    await db.collection("inquiries").doc(newInq.id).set(newInq);

    const metrics = await getDashboardMetrics();
    const today = new Date().getDay();
    const index = today === 0 ? 6 : today - 1;
    metrics.weeklyPerformance.leads[index] = (metrics.weeklyPerformance.leads[index] || 0) + 1;

    await updateDashboardMetrics(metrics);
    res.json({ success: true, inquiry: newInq });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/inquiries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("inquiries").doc(id).delete();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PROJECTS ENDPOINTS (Case Studies)
app.get("/api/projects", async (req, res) => {
  try {
    const snap = await db.collection("projects").get();
    const projects = snap.docs.map(doc => doc.data());
    projects.sort((a: any, b: any) => b.id.localeCompare(a.id));
    res.json({ success: true, projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/projects", async (req, res) => {
  try {
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

    await db.collection("projects").doc(project.id).set(project);
    res.json({ success: true, project });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    await db.collection("projects").doc(id).set(updates, { merge: true });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("projects").doc(id).delete();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// TESTIMONIALS ENDPOINTS (Reviews)
app.get("/api/testimonials", async (req, res) => {
  try {
    const snap = await db.collection("testimonials").get();
    const testimonials = snap.docs.map(doc => doc.data());
    testimonials.sort((a: any, b: any) => b.id.localeCompare(a.id));
    res.json({ success: true, testimonials });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/testimonials", async (req, res) => {
  try {
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

    await db.collection("testimonials").doc(newTest.id).set(newTest);
    res.json({ success: true, testimonial: newTest });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/testimonials/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.collection("testimonials").doc(id).set({ status }, { merge: true });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CATEGORIES ENDPOINTS
app.get("/api/categories", async (req, res) => {
  try {
    const snap = await db.collection("categories").get();
    const categories = snap.docs.map(doc => doc.data());
    categories.sort((a: any, b: any) => a.name.localeCompare(b.name));
    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    const id = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const category = { id, name: name.trim() };
    await db.collection("categories").doc(id).set(category);
    res.json({ success: true, category });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("categories").doc(id).delete();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/quotations", async (req, res) => {
  try {
    const snap = await db.collection("quotations").get();
    const quotations = snap.docs.map(doc => doc.data());
    res.json({ success: true, quotations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/quotations", async (req, res) => {
  try {
    const quotation = req.body;
    if (!quotation.id) {
      return res.status(400).json({ error: "Quotation ID is required" });
    }
    await db.collection("quotations").doc(quotation.id).set(quotation);
    res.json({ success: true, quotation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/quotations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("quotations").doc(id).delete();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  setupVite();
}

export default app;
