# WarmLoop CRM - Production Deployment Guide

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

---

## Project Overview

**WarmLoop CRM** is an AI-powered Customer Relationship Management system designed for busy founders and sales teams. Built with modern web technologies, it provides intelligent lead scoring, instant insights, and a clean pipeline management interface.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Charts**: Chart.js + Recharts
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod

### Key Features
- AI-assisted lead scoring and prioritization
- Real-time analytics dashboard
- CSV/Excel/JSON data import
- Lead management with activity tracking
- Auto-generated data visualizations
- Responsive SaaS-style landing page
- Secure authentication with Supabase Auth

---

## Features

### 1. Landing Page
- Professional SaaS-style design
- Hero section with dual CTAs
- Feature showcase with gradient cards
- Testimonials and social proof
- 3-tier pricing display
- SEO optimized

### 2. Lead Management
- Create, read, update, delete leads
- Lead scoring algorithm
- Activity tracking
- Status pipeline (New → Contacted → Qualified → Won/Lost)
- Bulk import from CSV/Excel/JSON

### 3. Analytics Dashboard
- Real-time metrics and KPIs
- Lead distribution charts
- Conversion funnel visualization
- Source tracking analytics
- Interactive data exploration

### 4. Data Import System
- Dual import workflows:
  - Dashboard import (localStorage + optional Supabase)
  - Direct leads import (Supabase only)
- Auto-column mapping with heuristics
- Data validation and error reporting
- Batch processing (500 rows per batch)
- Undo functionality

---

## Quick Start

### Prerequisites
- Node.js 20.9.0 (see `.nvmrc`)
- npm or pnpm package manager
- Supabase account (free tier available)

### 5-Minute Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd warmloop-crm

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Configure Supabase credentials in .env.local
# Get these from https://supabase.com/dashboard/project/_/settings/api

# 5. Start development server
npm run dev

# 6. Open browser to http://localhost:5173
```

---

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side only (for production deployment)
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Application Configuration
NODE_ENV=production
PORT=4173
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Navigate to **Settings → API**
4. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY` (keep secret!)

### GitHub Secrets Setup

For CI/CD, add these secrets to your GitHub repository:

1. Go to **Settings → Secrets and variables → Actions**
2. Add the following secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - (Optional) `SUPABASE_SERVICE_KEY` for server-side operations

---

## Local Development

### Install Dependencies
```bash
npm install
# or
pnpm install
```

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```
Output will be in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```
Opens preview server at [http://localhost:4173](http://localhost:4173).

### Linting
```bash
npm run lint
```

### Clean Install
```bash
npm run clean
npm install
```

---

## Production Deployment

### Option 1: Static Hosting (Vercel, Netlify, etc.)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting provider

3. **Configure environment variables** on your hosting platform

4. **Set up SPA routing**:
   - Vercel: Automatically handled
   - Netlify: Add `_redirects` file:
     ```
     /*    /index.html   200
     ```

### Option 2: Self-Hosted with Node.js

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Install serve**:
   ```bash
   npm install -g serve
   ```

3. **Start the server**:
   ```bash
   npm run start
   # or
   serve -s dist -l 4173
   ```

4. **Access at** [http://localhost:4173](http://localhost:4173)

### Option 3: Docker (see below)

---

## Docker Deployment

### Build Docker Image

```bash
docker build -t warmloop-crm:latest .
```

### Run Docker Container

```bash
docker run -d \
  -p 80:80 \
  --name warmloop-crm \
  warmloop-crm:latest
```

### Access Application

Open [http://localhost](http://localhost) in your browser.

### Environment Variables with Docker

For production, pass environment variables during build:

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key \
  -t warmloop-crm:latest .
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  warmloop-crm:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

Run with:
```bash
docker-compose up -d
```

### Health Check

The Docker container includes a health check endpoint:
```bash
curl http://localhost/health
```

---

## GitHub Actions CI/CD

### Pipeline Overview

The CI/CD pipeline includes:

1. **Lint Job**: Runs ESLint on codebase
2. **Build Job**: Compiles TypeScript and builds production bundle
3. **Security Audit Job**: Runs npm audit
4. **Docker Build Job**: Tests Docker image build (main/develop branches only)

### Workflow Triggers

- **Push**: All branches (main, develop, agent/*)
- **Pull Request**: To main or develop branches

### Using Build Artifacts

After successful builds, artifacts are available for 30 days:

1. Go to **Actions** tab in GitHub
2. Select a successful workflow run
3. Download **dist** artifact
4. Contains the production-ready build

### Setting Up Auto-Deploy

To enable automatic deployment, modify `.github/workflows/ci.yml`:

1. Add deployment step after build
2. Configure deployment credentials as GitHub Secrets
3. Choose deployment target (Vercel, Netlify, AWS, etc.)

---

## Database Setup

### Supabase Schema

The application requires the following database tables:

#### 1. Leads Table
```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,
  estimated_value NUMERIC,
  score INTEGER DEFAULT 0,
  activities_last_30d INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own leads
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON leads FOR DELETE
  USING (auth.uid() = user_id);
```

#### 2. Datasets Table (for data import feature)
```sql
CREATE TABLE datasets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  table_name TEXT,
  row_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own datasets"
  ON datasets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own datasets"
  ON datasets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasets"
  ON datasets FOR DELETE
  USING (auth.uid() = user_id);
```

### Authentication Setup

Supabase Auth is pre-configured. To customize:

1. Go to **Authentication → Settings** in Supabase Dashboard
2. Configure email templates
3. Set up OAuth providers (optional)
4. Configure redirect URLs

### Storage Setup (Optional)

For file uploads:

1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket (e.g., "uploads")
3. Configure RLS policies
4. Update application to use storage bucket

---

## Troubleshooting

### Build Errors

**Error**: `Cannot find module 'X'`
- **Solution**: Run `npm install` or `npm ci`

**Error**: TypeScript compilation errors
- **Solution**: Check `tsconfig.json` and ensure all types are installed

### Runtime Errors

**Error**: `Invalid Supabase credentials`
- **Solution**: Verify `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Error**: `Network error` or CORS issues
- **Solution**: Check Supabase project is active and API URL is correct

### Docker Issues

**Error**: Docker build fails
- **Solution**: Ensure Docker has enough memory (at least 2GB)
- **Solution**: Check Dockerfile syntax

**Error**: Container starts but app doesn't load
- **Solution**: Check nginx logs: `docker logs <container-id>`
- **Solution**: Verify nginx.conf is correct

### Performance Issues

**Slow initial load**:
- Check network tab for large bundle sizes
- Consider code splitting
- Enable gzip compression (nginx handles this)

**Slow data import**:
- Batch size is set to 500 rows - adjust if needed
- Large files may take time - consider progress indicators

---

## Security Considerations

### Environment Variables
- **NEVER** commit `.env.local` or `.env` files to git
- Use `.env.example` as template only
- Store production secrets in GitHub Secrets or environment variables on hosting platform

### Supabase Security
- **Row Level Security (RLS)** is enabled on all tables
- Users can only access their own data
- Service role key should only be used server-side

### Content Security Policy
- Nginx configuration includes security headers
- X-Frame-Options, X-Content-Type-Options, X-XSS-Protection set

### Authentication
- Supabase handles secure authentication
- Tokens are stored in httpOnly cookies
- Sessions expire after inactivity

### Dependencies
- Run `npm audit` regularly
- Keep dependencies updated
- Review security advisories

---

## Using artifacts.zip

The `artifacts.zip` file contains a complete deployment package:

### Contents
- `dist/` - Production build
- `README_PRODUCTION.md` - This file
- `.nvmrc` - Node version specification
- `.env.example` - Environment template
- `Dockerfile` - Container definition
- `nginx.conf` - Web server configuration
- `.github/workflows/ci.yml` - CI/CD pipeline
- `artifacts/00_dev_startup_log.md` - Build logs
- `artifacts/npm_audit_report.txt` - Security audit

### Deployment from artifacts.zip

1. **Extract the archive**:
   ```bash
   unzip artifacts.zip
   ```

2. **Serve the dist folder**:
   ```bash
   npx serve -s dist -l 4173
   ```

3. **Or use Docker**:
   ```bash
   docker build -t warmloop-crm .
   docker run -p 80:80 warmloop-crm
   ```

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Contact: support@warmloop.io (placeholder)

---

## Credits

**WarmLoop CRM** - Built with modern web technologies for efficient lead management.

**Contributors**: MiniMax Agent

**Last Updated**: 2025-10-31
