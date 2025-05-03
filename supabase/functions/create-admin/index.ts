
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Only proceed if the request is POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
      );
    }

    // Parse the request body
    const { email, name, adminKey } = await req.json();

    // Check if the admin key is correct (a basic security measure)
    const expectedAdminKey = Deno.env.get('ADMIN_CREATION_KEY');
    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid admin creation key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Verify email and name are provided
    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: 'Email and name are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Error checking existing admin:', checkError);
      return new Response(
        JSON.stringify({ error: 'Failed to check existing admin' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (existingAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin with this email already exists', id: existingAdmin.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      );
    }

    // Create the admin user in the database
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        email,
        name,
        role: 'admin'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating admin user:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create admin user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        message: 'Admin user created successfully', 
        admin: { id: newAdmin.id, email: newAdmin.email, name: newAdmin.name } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
