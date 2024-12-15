import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting update-user-role function')
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')?.split(' ')[1]
    console.log('Auth header present:', !!authHeader)
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the requesting user is an admin
    const { data: { user: requestingUser }, error: authError } = await supabase.auth.getUser(authHeader)
    console.log('Auth user check:', { userId: requestingUser?.id, error: authError })
    
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if requesting user is admin using user_id
    const { data: profiles, error: roleError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', requestingUser.id)
    
    console.log('Admin check:', { 
      profiles, 
      roleError, 
      requestingUserId: requestingUser.id,
      profileCount: profiles?.length ?? 0
    })

    if (roleError) {
      return new Response(
        JSON.stringify({ 
          error: 'Error checking admin status',
          details: roleError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Profile not found',
          details: { userId: requestingUser.id }
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const adminProfile = profiles[0]
    if (adminProfile.role !== 'admin') {
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized - Admin access required',
          details: { role: adminProfile.role, userId: requestingUser.id }
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get request body
    const { userId, newRole } = await req.json()
    console.log('Update request:', { userId, newRole })
    
    if (!userId || !newRole) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // First check if the target profile exists
    const { data: targetProfiles, error: targetError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)

    console.log('Target profile check:', { 
      targetProfiles, 
      targetError,
      targetUserId: userId,
      profileCount: targetProfiles?.length ?? 0
    })

    if (targetError) {
      return new Response(
        JSON.stringify({ 
          error: 'Error finding target user',
          details: targetError
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!targetProfiles || targetProfiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Target user profile not found',
          details: { userId }
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the user role
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()

    console.log('Update result:', { data, error })

    if (error) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update role',
          details: error
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data: data[0] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
