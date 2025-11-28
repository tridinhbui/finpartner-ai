# Environment Variables Template

Copy this to `.env.local` file:

```env
# Google Gemini API Key
# Get from: https://aistudio.google.com/apikey
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth Client ID  
# Get from: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Supabase Configuration
# Get from: https://supabase.com/dashboard/project/_/settings/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Notes:
- `.env.local` is gitignored and won't be committed to version control
- All environment variables must have `VITE_` prefix to be accessible in the app
- Restart dev server after changing environment variables

