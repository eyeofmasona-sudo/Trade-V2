<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/962ca4ed-e237-4c98-8920-c7ab124035fe

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Seed 1 ADMIN user (Supabase)

1. Copy envs from `.env.example` to your local env file and set:
   - `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - optional: `TRADE_ADMIN_EMAIL`, `TRADE_ADMIN_PASSWORD`, `TRADE_ADMIN_DISPLAY_NAME`
2. Run:
   - `npm run seed:admin`

This script creates (or updates) one Supabase Auth user and ensures a matching row in `public.users` with role `ADMIN`.
