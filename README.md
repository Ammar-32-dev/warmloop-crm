# WarmLoop CRM

A lightweight, modern CRM web application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Landing Page**: Modern, responsive design with clear value proposition
- **Authentication System**: Secure email-based login/signup with Supabase Auth
- **Dashboard**: Key metrics and KPIs at a glance (Total Leads, Average Score, Lead Distribution)
- **Lead Management**: Full CRUD operations for managing contacts and prospects with automatic scoring
- **Analytics**: Visual insights with charts showing pipeline distribution and top leads
- **Data Import**: Upload and analyze CSV, Excel, JSON, or SQL INSERT files
- **Auto-Generated Dashboards**: Automatic chart generation and data quality insights for imported datasets
- **AI Insights**: Rule-based recommendations for high-value leads and at-risk pipelines
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Live Demo

🚀 **Production URL**: [https://3338a47fearh.space.minimax.io](https://3338a47fearh.space.minimax.io)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Database, Authentication, RLS)
- **Routing**: React Router v6
- **Charts**: Chart.js + react-chartjs-2
- **File Parsing**: PapaParse (CSV), SheetJS (Excel)
- **Icons**: Lucide React

## Design

- **Theme**: Minimalist elegance with tech-forward sophistication
- **Colors**: Indigo 600 (primary), Sky 400 (accent), Zinc/Gray neutrals
- **Typography**: Poppins for headings, Inter for body text
- **UI/UX**: Clean cards, soft shadows, smooth transitions, glassmorphism effects

## Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- Supabase account (free tier works perfectly)

## Setup Instructions

### 1. Clone the Repository

```bash
cd warmloop-crm
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Supabase Configuration

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned
3. Go to Settings > API to find your project URL and anon key

#### Set Up Database Tables

Run these SQL queries in the Supabase SQL Editor:

```sql
-- Create leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY,
  full_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Users can view their own leads"
  ON leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leads"
  ON leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON leads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
  ON leads FOR DELETE
  USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 4. Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase credentials from Settings > API.

#### Optional: Disable Email Confirmation for Development/Testing

By default, Supabase requires email confirmation for new accounts. To make testing easier during development:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Settings
3. Under "Email Auth", disable "Enable email confirmations"
4. This allows immediate sign-in without email verification

**Note**: Re-enable this in production for security.

### 5. Run Development Server

```bash
pnpm dev
# or
npm run dev
```

The app will be available at `http://localhost:5173`

## Build for Production

```bash
pnpm build
# or
npm run build
```

The production build will be in the `dist/` directory, ready for deployment to any static hosting provider.

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables in Production

Make sure to add these environment variables in your hosting provider's dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
warmloop-crm/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── DashboardLayout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/                 # Utilities and configurations
│   │   └── supabase.ts
│   ├── pages/               # Page components
│   │   ├── LandingPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LeadsPage.tsx
│   │   └── AnalyticsPage.tsx
│   ├── services/            # API service functions
│   │   └── leadsService.ts
│   ├── App.tsx              # Main app with routing
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── .env                     # Environment variables (local)
├── .env.example             # Environment template
├── package.json
├── vite.config.ts
└── README.md
```

## Usage

### Creating an Account

1. Click "Get Started" or "Sign In" on the landing page
2. Switch to "Sign Up" mode
3. Enter your email and password (minimum 6 characters)
4. Check your email for confirmation link
5. Confirm your account and sign in

### Managing Leads

- **Add Lead**: Click the "+ Add Lead" button on the Leads page
- **Edit Lead**: Click the edit icon next to any lead
- **Delete Lead**: Click the delete icon and confirm
- **View Details**: All lead information is displayed in the table

### Lead Fields

- **Name**: Contact's full name (required)
- **Email**: Contact's email address (required)
- **Company**: Associated company name (optional)
- **Score**: Lead quality score 0-100 (default: 0)
- **Status**: Current status (new, contacted, qualified, lost, won)

### Analytics

The Analytics page provides visual insights:
- **Lead Pipeline**: Doughnut chart showing distribution by status
- **Top Scored Leads**: Bar chart of highest-scoring leads
- **Quick Insights**: Summary statistics

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Authentication handled by Supabase Auth
- No sensitive data exposed to client

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
