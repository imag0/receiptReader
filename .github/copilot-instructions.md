<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Receipt Scanner MVP - Development Guidelines

## Project Overview
This is a Receipt Scanner MVP built with Next.js, focusing on simplicity and essential features only. The core principle is "no feature creep" - only implement the 6 core features listed below.

## Core Features (ONLY THESE)
1. **Upload Receipt Photo** - Drag & drop or camera upload (JPG, PNG, HEIC, max 10MB)
2. **Extract Data** - Vendor, date, total amount, category, currency using OpenAI GPT-4 Vision
3. **Export** - Download CSV, copy to clipboard, email to self
4. **Receipt History** - List, search by vendor/date/amount, delete receipt
5. **Authentication** - Email + password login, forgot password flow
6. **Subscription** - Free (5 receipts/month) vs Pro ($15/month unlimited)

## Tech Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL via Supabase
- **Storage**: Supabase storage for receipt images
- **Auth**: NextAuth.js with credentials provider
- **Payments**: Stripe
- **AI**: OpenAI GPT-4 Vision API

## Key Principles
- Keep it simple - resist feature creep
- Use only the dependencies already installed
- Follow the database schema in `database/schema.sql`
- All pages should be responsive and use Tailwind CSS
- Error handling should be graceful but simple
- No complex state management - use React hooks

## File Structure
- `/src/app` - Next.js app router pages and API routes
- `/src/components` - Reusable components (create as needed)
- `/database` - SQL schema and migrations
- Environment variables in `.env.local`

## Development Guidelines
- Use TypeScript strictly
- Follow Next.js 15 App Router conventions
- Use Tailwind CSS for styling
- Keep components simple and focused
- Handle errors gracefully
- Use proper HTTP status codes in API routes
- Validate user input

## What NOT to Add
- Mobile apps
- QuickBooks integration
- Multi-currency conversion
- OCR alternatives
- Bulk upload
- Team features
- API for developers
- Analytics dashboard
- Complex customization
- Any PQC, HSM, or government compliance features
