# 🏏 Sports Auction - Premier Auction Simulator

> An authentic, high-octane IPL & cricket franchise auction simulator built with React, Vite, and Tailwind CSS. Featuring broadcast-grade graphics, authentic player cutouts in official franchise jerseys, exact auction increments, dynamic Web Audio sound effects, and multiplayer room creation.

Inspired by [playauctiongame.com](https://www.playauctiongame.com/) with enhanced graphics, role-specific celebrations in franchise colors, and deeper multi-format statistics.

---

## ✨ Features

- **🏆 10 IPL Franchises**: Complete 2026 purse balances, retentions, official colors, and squad slots (CSK, MI, RCB, KKR, SRH, DC, RR, GT, LSG, PBKS).
- **📸 Official Player Cutouts**: Real cutouts of marquee players in their official franchise jerseys.
- **📊 Multi-Format Statistics**: Real-time stats across **IPL**, **International (T20I, ODI, Test)**, and **Domestic** cricket.
- **⚡ Exact Increments & 5-Second Rapid Timer**:
  - `< 100 Lakhs` (< ₹1 Cr): **+₹5 Lakhs**
  - `100 - 199 Lakhs` (₹1 - ₹2 Cr): **+₹10 Lakhs**
  - `200 - 499 Lakhs` (₹2 - ₹5 Cr): **+₹20 Lakhs**
  - `≥ 500 Lakhs` (₹5 Cr+): **+₹25 Lakhs**
  - Whenever a bid is placed, the countdown timer resets directly to **5 seconds** for fast-paced bidding.
- **🎉 Role-Specific "SOLD" Celebrations**:
  - Custom SVG animations for **Batter** (with willow bat), **Bowler** (high arm delivery stride), **All-Rounder**, and **Wicket-Keeper**.
  - Dynamic jersey recoloring matching the winning franchise's colors and team crest.
  - Double confetti bursts in franchise colors.
- **🔊 Web Audio API Sound Effects**: Zero-dependency synthesizer for gavel strikes, timer warning ticks, victory fanfares, and unsold buzzer.
- **👥 Room Creation & Waiting Lobby**:
  - Customizable room codes, purse values, timer duration, and private/public modes.
  - Pre-auction franchise claim board, AI bot fillers, and lobby chat.
- **📋 Playing XI & Squad Analyzer**: Interactive matchday team builder with batting depth, pace/spin balance, and overall synergy scores.
- **📺 Broadcast Ticker**: Live bottom news ticker tracking bids, purse values, and overseas limits.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Aravind1Kumar/sportsauction.git
cd sportsauction

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **FX**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio**: Web Audio API (native, zero-dependency synthesizer)

---

## 📄 License

MIT License. Designed and built with ❤️ for cricket fans.
