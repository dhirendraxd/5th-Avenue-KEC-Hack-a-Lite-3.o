# 🏗️ Upyog

> *Because your excavator deserves a side hustle too.*

A refreshingly simple B2B equipment rental marketplace that treats rental agreements with the seriousness they deserve—and the UI polish your eyes appreciate. Built for KEC Hack-a-Lite 3.0, because sometimes the best business ideas come from realizing that expensive equipment spends more time gathering dust than building skyscrapers.

[![Built with React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com/)

---

## 🎯 What's This All About?

**Upyog** is an equipment rental platform that makes sharing heavy machinery as easy as ordering pizza—except you can't eat a concrete mixer (trust us, we checked). We're connecting equipment owners with businesses that need tools, scaffolding, and machinery for short-term projects.

Think of it as Airbnb, but for things that weigh several tons and have absolutely zero aesthetic appeal.

### The Problem We're Solving

- **Equipment owners:** Have expensive machinery sitting idle 70% of the time, slowly depreciating into very expensive paperweights
- **Renters:** Need equipment for specific projects but can't justify buying a NPR 5M crane for a 3-day job
- **The Planet:** Loves it when we share instead of manufacturing duplicate everything
- **Your wallet:** Also loves this arrangement

---

## ✨ Features That Actually Matter

### For Equipment Owners (The "I Have Big Toys" Crowd)

- **📋 Smart Listings** - Upload equipment with photos, pricing, and availability. Our typewriter effect makes it look like magic is happening.
- **💰 Finance Dashboard** - Track earnings, view payout summaries, and pretend you're a CFO (with prettier charts).
- **📊 Rental Timeline** - Visual timeline showing when your equipment is booked vs. when it's lonely and available.
- **🔔 Real-time Notifications** - Get pinged when someone wants to rent your stuff (the good kind of pinging).
- **✅ Approval Workflow** - Accept or reject rental requests. Power feels good, doesn't it?

### For Renters (The "I Need This Right Now" People)

- **🔍 Intelligent Search** - Type what you need, where you need it. Our search actually understands "concrete mixer near Kathmandu" instead of showing you coffee grinders.
- **💬 Owner Chat** - Message owners directly. No carrier pigeons required.
- **📅 Date Selection** - Pick rental periods with a calendar that doesn't make you question your life choices.
- **📸 Condition Logging** - Document equipment condition at pickup/return with photos. CYA, professionally.
- **🔄 Extension Requests** - Need it for longer? Request extensions without the awkward phone call.

### For Everyone (Because We Care About UX)

- **🎨 Actually Pleasant UI** - Minimal design with subtle animations. No assault on your eyeballs.
- **🔐 Firebase Auth** - Google sign-in that works. Revolutionary, we know.
- **📱 Responsive Design** - Works on phones, tablets, and that weird screen size your boss insists on using.
- **🌿 Sustainability Stats** - Feel good about sharing. We calculate CO₂ saved (roughly).
- **🚨 Task Flagging** - Flag issues during rentals. Drama resolution, digitized.

---

## 🛠️ Tech Stack (The Good Stuff)

### Core Framework
- **React 18** - Because functional components and hooks are *chef's kiss*
- **TypeScript 5** - Type safety or bust (mostly safety)
- **Vite 5** - Fast builds so you can iterate like a caffeinated squirrel

### UI & Styling
- **Tailwind CSS** - Utility-first CSS that makes sense once you get over the className length
- **shadcn/ui** - Beautiful component primitives that we customized heavily
- **Radix UI** - Accessible components that don't look like they're from 2002
- **Lucide Icons** - Icons that spark joy (literally, we have a Sparkles icon with pulse animation)

### Backend & Data
- **Firebase 10**
  - Firestore: NoSQL database (because schemas are so last decade)
  - Firebase Auth: Google OAuth magic
  - Firebase Storage: For all those equipment glamour shots
- **TanStack Query** - Data fetching that doesn't make you cry

### State & Utilities
- **React Hook Form** - Forms that validate themselves (self-actualizing forms!)
- **Zod** - Schema validation that TypeScript approves of
- **date-fns** - Date manipulation without the pain
- **clsx** - Conditional classNames without the mess

---

## 🚀 Getting Started

### Prerequisites

You'll need Node.js installed. If you don't have it:
```bash
# Don't panic, just install it
# We recommend using nvm (Node Version Manager)
```

### Installation

```bash
# Clone this beauty
git clone https://github.com/dhirendraxd/5th-Avenue-KEC-Hack-a-Lite-3.o.git
cd 5th-Avenue-KEC-Hack-a-Lite-3.o

# Install dependencies (grab coffee, this takes a minute)
npm install

# Start the dev server
npm run dev
```

Your browser should open to `http://localhost:5173` and you'll see the homepage in all its animated glory.

### Environment Setup

Create a `.env` file in the root directory with your Firebase + Cloudinary credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset_here
```

> **Pro tip:** Don't commit this file. Git will ignore it, but your security team won't ignore you if you leak keys.

---

## 📁 Project Structure

```
src/
├── components/          # React components organized by feature
│   ├── chat/           # Chat panel and bubbles
│   ├── dashboard/      # Owner dashboard components
│   ├── equipment/      # Equipment cards and details
│   ├── finance/        # Charts and transaction stuff
│   ├── home/           # Homepage sections (with fancy animations)
│   ├── layout/         # Navbar, Footer, BackgroundIllustrations
│   ├── rental/         # Rental operations components
│   └── ui/             # shadcn/ui components (40+ of them)
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom hooks for Firebase, mobile detection
├── lib/                # Utilities, stores, mock data, Firebase wrappers
├── pages/              # Page-level components
└── integrations/       # Supabase (we tried it, then went with Firebase)
```

---

## 🎨 Design Philosophy

We believe in:
- **Minimalism** - If it doesn't serve a purpose, it doesn't exist
- **Subtle Motion** - Animations are like spices: a little goes a long way
- **Consistency** - All CTAs have blue underlines on hover. ALL OF THEM.
- **Professional Aesthetics** - Sage green for active states. Blue for primary actions. No Comic Sans ever.
- **Accessibility** - Focus states, ARIA labels, keyboard navigation. We're not monsters.

### Color Palette
- **Primary Blue** - `hsl(217 91% 55%)` - For important stuff
- **Success/Sage Green** - `hsl(152 60% 45%)` - For approvals and active states
- **Muted Everything Else** - Soft neutrals that don't scream at you

---

## 🏃‍♂️ Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build (outputs to /dist)
npm run build

# Preview production build locally
npm run preview

# Lint your code (because standards)
npm run lint
```

---

## 🔥 Firebase Setup Guide

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Google Sign-In
4. Create a **Firestore Database** (start in test mode for development)
5. (Optional) Create **Storage** bucket if you want Firebase Storage later
6. Copy your config to `.env` file

### Cloudinary Setup (Recommended for image hosting)

1. Go to [Cloudinary Console](https://console.cloudinary.com/) and create/login to your account.
2. From **Dashboard**, copy your **Cloud Name**.
3. Open **Settings → Upload → Upload presets** and create a preset.
4. Set the preset to **Unsigned**.
5. (Recommended) Restrict the preset to `image` uploads only.
6. Add these env vars:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

After this, listing uploads images to Cloudinary and stores public image URLs in Firestore so all users can view them.

### Firestore Collections Structure

```
equipment/
  - id (auto)
  - name, description, category
  - pricePerDay, pricePerWeek, pricePerMonth
  - owner: { uid, name, email, location }
  - images[], features[]
  - depositAmount, specifications
  - availabilityWindows[], usageNotes

users/
  - uid (document ID)
  - email, displayName, photoURL
  - role: 'owner' | 'renter'
  - createdAt, lastActive

rentals/
  - id (auto)
  - equipmentId, renterId, ownerId
  - startDate, endDate, status
  - totalCost, conditionLogs[]
```

---

## 🤔 FAQs

### Why "Upyog"?
Because "Upyog" means "use" or "utilization" in Sanskrit/Nepali—perfectly fitting for a platform about utilizing idle equipment. Plus, it sounds way cooler than "Rent-A-Thing".

### Is this production-ready?
It's hackathon-ready, which is like production-ready but with more energy drinks and fewer tests.

### Can I contribute?
Sure! Open an issue or PR. We accept code improvements and dad jokes.

### Why Firebase instead of Supabase?
We tried Supabase first (check `/src/integrations/supabase`), then realized Firebase Auth UX is just *better*. Sorry, Supabase fans.

### What's with all the animations?
Because we can. Also, they make the app feel polished and professional without being distracting.

### Will this scale?
With proper Firebase security rules and indexing? Absolutely. Without them? Please don't try.

---

## 🐛 Known Issues

- Bundle size is chunky (~1.6MB before gzip). We're optimists about dynamic imports.
- Browserslist data is 8 months old. We live dangerously.
- No comprehensive test suite yet. Manual testing is a valid strategy, right?

---

## 🎓 What We Learned

1. **TypeScript is your friend** - Caught 847 bugs before they became embarrassing
2. **Good UI takes time** - We spent 40% of dev time on animations and spacing
3. **Firebase is magical** - Until you forget security rules
4. **Tailwind class names get long** - Like, really long. Embrace it.
5. **Users appreciate attention to detail** - Typewriter effects and fade-ins matter

---

## 📜 License

MIT License - Do whatever you want with this code. Build empires. Rent excavators. We believe in you.

---

## 🙏 Acknowledgments

- **shadcn** for making UI components that don't suck
- **Vercel** for Vite (speedy builds = happy devs)
- **Google Firebase** for auth that actually works
- **Coffee** for existing
- **KEC Hack-a-Lite 3.0** for the deadline-induced focus

---

## 📞 Contact

Built with ❤️ and excessive attention to underline animations.

**Team:** Upyog  
**Event:** KEC Hack-a-Lite 3.0  
**Repo:** [github.com/dhirendraxd/5th-Avenue-KEC-Hack-a-Lite-3.o](https://github.com/dhirendraxd/5th-Avenue-KEC-Hack-a-Lite-3.o)

---

<p align="center">
  <i>"Making idle equipment useful, one rental at a time."</i>
  <br><br>
  <b>Now go forth and rent responsibly. 🏗️</b>
</p>
