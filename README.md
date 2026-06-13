# GradTracker Frontend 🎓

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

A modern, high-performance web application designed for academic institutions to monitor and predict student graduation trajectories. Built with **Next.js 14 (App Router)** and **Tailwind CSS**.

## ✨ Key Features
- **Role-Based Access Control (RBAC)**: Distinct interfaces for Students (Public Prediction), Head of Study Programs (Kaprodi Analytics), and Admins (ML Model Management).
- **Real-Time Analytics Dashboard**: Visualizes student academic trends, IPS distributions, and risk populations using `Recharts`.
- **Advanced UI/UX**: Implements high-contrast aesthetic designs, micro-animations, skeleton loaders, and full Dark Mode support using `Shadcn UI`.
- **Machine Learning Integration**: Connects to the FastAPI backend to seamlessly serve real-time predictions powered by XGBoost.

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Components**: Shadcn UI, Radix UI, Lucide Icons
- **Data Visualization**: Recharts
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd gradtracker-fe
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables (create a `.env.local` file):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Architecture Overview
- `/src/app`: Next.js App Router definitions (Public and `(protected)` routes).
- `/src/components`: Modular UI components (Dashboard, Forms, Layout, UI primitives).
- `/src/context`: Global state providers (`AuthContext`, `I18nContext`).
- `/src/lib`: Utility functions and API service wrappers.
