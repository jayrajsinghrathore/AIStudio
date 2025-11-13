# Creative Studio — Beauty Ad Generator

A production-ready Next.js application for generating stunning beauty product advertisements using AI. Built with TypeScript, Tailwind CSS, shadcn/ui, Supabase, Google Gemini, and Banana.dev.

## Features

- **AI-Powered Prompt Enhancement**: Use Google Gemini to refine and enhance your prompts with professional photography details
- **Intelligent Image Generation**: Create professional beauty ad images using Banana.dev AI with multiple style presets
- **Secure Authentication**: Email/password auth with Supabase and Row Level Security
- **Personal Gallery**: View, download, and manage all your generated images
- **Style Presets**: Choose from Photorealistic, Oil Painting, Social Ad, or Catalog styles
- **Responsive Design**: Mobile-first design with modern gradient UI and smooth animations
- **Production Ready**: Fully typed with TypeScript, optimized for Vercel deployment

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes |
| Authentication | Supabase Auth (Email/Password) |
| Database | Supabase PostgreSQL with RLS |
| AI - Text | Google Gemini API (prompt enhancement) |
| AI - Images | Banana.dev (Stable Diffusion) |
| Storage | Supabase Storage |
| Deployment | Vercel |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project (free tier available)
- Google Gemini API key (free tier available)
- Banana.dev account (for image generation)

### Installation

1. **Clone and install dependencies**
   \`\`\`bash
   git clone <repository-url>
   cd creative-studio
   npm install
   \`\`\`

2. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your credentials:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   GOOGLE_AI_API_KEY=your-google-ai-api-key
   BANANA_API_KEY=your-banana-api-key
   BANANA_MODEL_KEY=your-banana-model-key
   NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
   \`\`\`

3. **Set up the database**
   
   Run the database migration:
   \`\`\`bash
   npm run setup:db
   \`\`\`
   
   This creates:
   - `generations` table with columns: id, user_id, original_prompt, enhanced_prompt, image_url, style_preset, created_at, updated_at
   - Row Level Security policies (users can only access their own data)
   - Proper indexes for performance

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
creative-studio/
├── app/
│   ├── api/
│   │   ├── enhance/route.ts          # Google Gemini prompt enhancement
│   │   └── generate/route.ts         # Banana.dev image generation
│   ├── auth/
│   │   ├── login/page.tsx            # Login page
│   │   ├── signup/page.tsx           # Signup page
│   │   ├── signup-success/page.tsx   # Email confirmation page
│   │   └── callback/route.ts         # OAuth callback handler
│   ├── generations/page.tsx          # Image gallery
│   ├── studio/page.tsx               # Main creation studio
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   └── globals.css                   # Global styles
├── lib/
│   ├── google-api.ts                 # Google Gemini wrapper functions
│   ├── supabase-server.ts            # Server-side Supabase utilities
│   └── supabase/
│       ├── client.ts                 # Browser Supabase client
│       ├── server.ts                 # Server Supabase client
│       └── middleware.ts             # Auth middleware
├── components/
│   ├── header.tsx                    # Navigation header
│   ├── prompt-input.tsx              # Prompt input with enhance button
│   ├── style-presets.tsx             # Style preset selector
│   └── ui/                           # shadcn/ui components
├── middleware.ts                     # Next.js auth middleware
├── scripts/
│   └── 001_create_tables.sql         # Database schema
└── README.md                         # This file
\`\`\`

## Core Features

### 1. Authentication

- **Sign Up**: Email/password registration with confirmation email
- **Email Confirmation**: Required before accessing the app
- **Login**: Secure session management via Supabase
- **Logout**: Clears session and redirects to login
- **Protected Routes**: Middleware automatically protects authenticated pages

### 2. Prompt Enhancement (Google Gemini)

The `/api/enhance` endpoint transforms simple prompts into detailed, professional descriptions:

**System Prompt Focus:**
- Subject description and product details
- Composition and camera framing
- Lens characteristics and depth of field
- Lighting setup (key, fill, backlighting)
- Color palette and tones
- Textures and surface qualities
- Mood and atmosphere
- Photography style keywords

**Example:**
\`\`\`
Input: "Luxury lipstick ad"
Output: "Ultra-luxurious liquid lipstick product shot with macro photography, 
soft window lighting with subtle fill reflections, rich burgundy and rose tones, 
dewy finish with subtle shimmer reflections, minimalist rose marble background, 
professional beauty photography, shallow depth of field, shot on Hasselblad 907x 
with 80mm lens, creamy smooth product surface, elegant mood, high-end magazine 
cover quality, style: Photorealistic"
\`\`\`

**Supported Style Presets:**
- Photorealistic: Professional photography
- Oil Painting: Artistic painting effect
- Social Ad: Optimized for social media
- Catalog: Product catalog style

### 3. Image Generation (Banana.dev)

The `/api/generate` endpoint creates images with controlled variations:

- Accepts enhanced prompt
- Generates multiple variations with slight modifications:
  - Variation 1: Warmer tones and golden hour lighting
  - Variation 2: Cooler tones and studio lighting
  - Variation 3: Vintage color grading and soft focus
  - Variation 4: Cinematic depth and dramatic shadows
- Stores images in Supabase Storage
- Saves metadata to database
- Returns image URLs

**Rate Limiting:** 3 generations per minute per user

### 4. Gallery Management

The `/generations` page displays:
- Responsive grid of all user-generated images
- Hover effects with download, delete, and fullscreen options
- Style preset badge on each image
- Original prompt preview
- Creation timestamp
- Fullscreen modal viewer
- Download as PNG functionality

## Database Schema

### Generations Table

\`\`\`sql
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_prompt TEXT NOT NULL,
  enhanced_prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  style_preset TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC', NOW())
);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view their own generations" 
  ON public.generations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations" 
  ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations" 
  ON public.generations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations" 
  ON public.generations FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_created_at ON public.generations(created_at DESC);
\`\`\`

## API Reference

### POST /api/enhance

Enhances a prompt using Google Gemini API.

**Request:**
\`\`\`bash
curl -X POST http://localhost:3000/api/enhance \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Luxury lipstick ad",
    "stylePreset": "Photorealistic"
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "enhancedPrompt": "Ultra-luxurious liquid lipstick product shot with macro photography, soft window lighting..."
}
\`\`\`

**Error Responses:**
- 400: Invalid input
- 429: Rate limit exceeded (10 requests/minute)
- 500: Server error

---

### POST /api/generate

Generates images using Banana.dev AI.

**Request:**
\`\`\`bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "prompt": "Luxury lipstick ad",
    "enhancedPrompt": "Ultra-luxurious liquid lipstick...",
    "numVariations": 1,
    "stylePreset": "Photorealistic"
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "generationId": "gen-1704067200000-abc123def456",
  "imageUrls": ["https://storage.url/image1.png"],
  "message": "Images generated successfully"
}
\`\`\`

**Error Responses:**
- 400: Invalid input
- 401: Unauthorized (must be logged in)
- 429: Rate limit exceeded (3 requests/minute)
- 500: Server error

---

## Environment Variables

### Required

- **NEXT_PUBLIC_SUPABASE_URL** - Supabase project URL (safe to expose)
- **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Supabase anonymous key (safe to expose)
- **SUPABASE_SERVICE_ROLE_KEY** - Supabase service role key (SECRET - never expose)
- **GOOGLE_AI_API_KEY** - Google Gemini API key (SECRET - only used server-side)
- **BANANA_API_KEY** - Banana.dev API key (SECRET - only used server-side)
- **BANANA_MODEL_KEY** - Banana.dev model key (SECRET - only used server-side)

### Optional

- **NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL** - For local development email redirects (default: http://localhost:3000)

## Security

### Row Level Security (RLS)

- All database queries are protected by RLS policies
- Users can only access their own data
- Policies are enforced at the database level (cannot be bypassed)

### Authentication

- Sessions managed securely by Supabase
- Automatic token refresh
- Email confirmation required before app access
- Middleware protects authenticated routes

### API Security

- All API routes check for authenticated user
- Sensitive operations use `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- Environment variables never exposed to client
- Rate limiting prevents abuse

### Data Protection

- User data encrypted in transit (HTTPS)
- Supabase provides encryption at rest
- Automatic backups enabled in Supabase settings
- GDPR compliance through Supabase

## Deployment to Vercel

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js configuration

3. **Add Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add all variables from `.env.example`:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY
     - GOOGLE_AI_API_KEY
     - BANANA_API_KEY
     - BANANA_MODEL_KEY
   - For production, add NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL pointing to your deployed domain

4. **Deploy**
   - Click "Deploy"
   - Vercel automatically builds and deploys to production
   - Any push to `main` branch triggers automatic redeploy

## Local Development

### Start Development Server
\`\`\`bash
npm run dev
\`\`\`
Server runs at http://localhost:3000

### Database Setup
\`\`\`bash
npm run setup:db
\`\`\`

### Lint Code
\`\`\`bash
npm run lint
\`\`\`

## Important Notes

### DO NOT USE OpenAI
This project uses **Google Gemini** for prompt enhancement and **Banana.dev** for image generation. OpenAI APIs are not used anywhere. Remove any OpenAI references if found.

### API Key Setup Guide

#### Google Gemini API
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create new API key for your project
4. Copy key to `GOOGLE_AI_API_KEY`

#### Banana.dev
1. Go to [banana.dev](https://www.banana.dev)
2. Sign up and create account
3. Deploy a model (recommend Stable Diffusion)
4. Get API key and model key from dashboard
5. Copy to `BANANA_API_KEY` and `BANANA_MODEL_KEY`

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy URL and keys
5. Fill in all three Supabase env variables

## Troubleshooting

### "Failed to enhance prompt"
- Check `GOOGLE_AI_API_KEY` is valid
- Verify API key has necessary permissions
- Check rate limit (10/minute)
- Review API usage in Google Cloud Console

### "Failed to generate image"
- Verify `BANANA_API_KEY` and `BANANA_MODEL_KEY`
- Ensure Banana model is deployed and running
- Check user is authenticated
- Review rate limit (3/minute per user)

### "Unauthorized" on generation
- Verify user is logged in
- Check Supabase session is valid
- Clear browser cookies and login again

### Database queries failing
- Ensure RLS policies are enabled in Supabase
- Verify user is authenticated
- Check database columns match schema
- Review Supabase logs

## Performance Tips

1. **Image Caching**: Use Supabase Storage CDN for image delivery
2. **Database**: Add indexes on `user_id` and `created_at` for faster queries
3. **Client-side**: Implement image lazy loading on gallery page
4. **Compression**: Optimize generated images with next/image

## Future Enhancements

- [ ] Batch image generation (multiple variations at once)
- [ ] Image editing tools (crop, resize, filter)
- [ ] Export templates for social media (Instagram, TikTok, Pinterest)
- [ ] Sharing and collaboration features
- [ ] Advanced prompt templates and presets
- [ ] Analytics dashboard (popular styles, trends)
- [ ] Multi-language support

## License

MIT - See LICENSE file for details

## Support

For issues or questions:
- Open a GitHub issue
- Check documentation at [docs.creativestudio.app](https://docs.creativestudio.app)
- Email support@creativestudio.app

---

Built with ❤️ using Next.js, Supabase, Google Gemini, and Banana.dev

**Important:** This project does NOT use OpenAI. It uses Google Gemini for text and Banana.dev for images.
