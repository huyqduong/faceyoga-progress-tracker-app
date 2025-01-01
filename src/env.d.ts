/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_VIMEO_ACCESS_TOKEN: string
  readonly VITE_VIMEO_CLIENT_ID: string
  readonly VITE_VIMEO_CLIENT_SECRET: string
  readonly VITE_TINYMCE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
