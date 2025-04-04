import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ruekhatbgjgtvhcwhlvf.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWtoYXRiZ2pndHZoY3dobHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MjIzNzIsImV4cCI6MjA1OTA5ODM3Mn0.2iTnz5Q_JgnB09K9AhVHJ-2i243oRs4EqVCI7y0UIcQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
