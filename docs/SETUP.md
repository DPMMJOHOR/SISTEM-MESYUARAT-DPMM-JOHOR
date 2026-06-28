# DPMM Johor Systems - Comprehensive Setup Documentation

## Overview
This document provides comprehensive setup instructions for the DPMM Johor Meeting System and Member System, including installation, configuration, and deployment.

## Table of Contents
1. Prerequisites
2. System Architecture
3. Supabase Setup
4. Meeting System Setup
5. Member System Setup
6. Edge Functions Setup
7. Environment Configuration
8. Testing
9. Deployment
10. Troubleshooting

## 1. Prerequisites

### Required Software
- Node.js 20+ 
- Git
- Web browser (Chrome, Firefox, Safari)
- Supabase account

### Required Accounts
- GitHub account
- Supabase account
- Twilio account (for WhatsApp)
- Groq account (for chatbot)

### System Requirements
- 2GB RAM minimum
- 10GB disk space
- Stable internet connection

## 2. System Architecture

### Components
- **Meeting System**: Meeting management and WhatsApp blast
- **Member System**: Member management and payment tracking
- **Supabase**: Database, auth, and Edge Functions
- **Twilio**: WhatsApp API
- **Groq**: AI chatbot

### Data Flow
```
Meeting System ←→ Supabase ←→ Member System
         ↓                ↓
      Twilio          Groq
```

## 3. Supabase Setup

### 3.1 Create Project
1. Go to https://supabase.com
2. Click "New Project"
3. Enter project name: `dpmm-johor`
4. Enter database password (save securely)
5. Select region: Southeast Asia (Singapore)
6. Click "Create Project"

### 3.2 Enable Auth
1. Go to Authentication → Settings
2. Enable Email auth
3. Enable Phone auth (optional)
4. Configure SMTP settings for email

### 3.3 Create Tables
Run SQL migrations in order:
1. `migrations/enable-supabase-auth.sql`
2. `migrations/add-tarikh-bayaran-2026.sql`

### 3.4 Configure Environment Variables
Add to Supabase project:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
- `GROQ_API_KEY`

## 4. Meeting System Setup

### 4.1 Clone Repository
```bash
git clone https://github.com/DPMMJOHOR/SISTEM-MESYUARAT-DPMM-JOHOR.git
cd SISTEM-MESYUARAT-DPMM-JOHOR
```

### 4.2 Install Dependencies
```bash
npm install
```

### 4.3 Configure Environment
Create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MEETING_SYSTEM_URL=https://dpmmjohor.github.io/SISTEM-MESYUARAT-DPMM-JOHOR
VITE_MEMBER_SYSTEM_URL=https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR
```

### 4.4 Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

### 4.5 Build for Production
```bash
npm run build
```

## 5. Member System Setup

### 5.1 Clone Repository
```bash
git clone https://github.com/DPMMJOHOR/SISTEM-AHLI-DPMM-JOHOR.git
cd SISTEM-AHLI-DPMM-JOHOR
```

### 5.2 Install Dependencies
```bash
npm install
```

### 5.3 Configure Environment
Create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MEETING_SYSTEM_URL=https://dpmmjohor.github.io/SISTEM-MESYUARAT-DPMM-JOHOR
VITE_MEMBER_SYSTEM_URL=https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR
```

### 5.4 Run Development Server
```bash
npm run dev
```
Open http://localhost:3000

### 5.5 Build for Production
```bash
npm run build
```

## 6. Edge Functions Setup

### 6.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 6.2 Link Project
```bash
supabase link --project-ref your-project-id
```

### 6.3 Deploy Functions
```bash
supabase functions deploy groq-chatbot
supabase functions deploy whatsapp-blast
```

### 6.4 Set Function Secrets
```bash
supabase secrets set TWILIO_ACCOUNT_SID=your-sid
supabase secrets set TWILIO_AUTH_TOKEN=your-token
supabase secrets set TWILIO_WHATSAPP_NUMBER=your-number
supabase secrets set GROQ_API_KEY=your-key
```

## 7. Environment Configuration

### Development
- Use local Supabase project
- Use test Twilio number
- Use test Groq API
- Enable debug mode

### Staging
- Use staging Supabase project
- Use staging Twilio number
- Use staging Groq API
- Enable logging

### Production
- Use production Supabase project
- Use production Twilio number
- Use production Groq API
- Enable monitoring

## 8. Testing

### 8.1 Run Unit Tests
```bash
npm test
```

### 8.2 Run Integration Tests
```bash
npm run test:integration
```

### 8.3 Run E2E Tests
```bash
npm run test:e2e
```

### 8.4 View Coverage
```bash
npm run test:coverage
```

## 9. Deployment

### 9.1 GitHub Pages
Both systems deploy to GitHub Pages via GitHub Actions:
1. Push to main branch
2. GitHub Actions builds and deploys
3. Access at GitHub Pages URL

### 9.2 Custom Domain
1. Configure DNS settings
2. Add custom domain in GitHub
3. Enable HTTPS
4. Update environment variables

## 10. Troubleshooting

### Common Issues

#### Supabase Connection Failed
- Check Supabase URL and key
- Verify network connectivity
- Check Supabase status

#### Auth Not Working
- Verify Supabase Auth enabled
- Check email configuration
- Verify RLS policies

#### WhatsApp Blast Failed
- Check Twilio credentials
- Verify phone number format
- Check Edge Function logs

#### Build Failed
- Check Node.js version
- Clear node_modules and reinstall
- Check for syntax errors

### Getting Help
- Check GitHub Issues
- Review documentation
- Contact support team

## Security Checklist
- [ ] All secrets in environment variables
- [ ] RLS policies enabled
- [ ] HTTPS enforced
- [ ] CSP configured
- [ ] SRI enabled
- [ ] Rate limiting enabled
- [ ] Account lockout enabled
- [ ] PII encrypted

## Next Steps
After setup:
1. Create admin user
2. Add test members
3. Test all features
4. Deploy to production
