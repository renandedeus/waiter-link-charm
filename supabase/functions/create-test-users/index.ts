
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
    const adminAuthClient = supabase.auth.admin;
    
    // Verificar acesso (usando uma chave secreta apenas para esta função)
    const { adminKey } = await req.json();
    const expectedAdminKey = Deno.env.get('ADMIN_CREATION_KEY');
    
    if (!expectedAdminKey || adminKey !== expectedAdminKey) {
      return new Response(
        JSON.stringify({ error: 'Acesso não autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Remover usuários de teste existentes (para evitar duplicatas)
    try {
      // Procurar usuários por e-mail
      const { data: adminEmailData } = await supabase.auth.admin.listUsers();
      
      const adminUser = adminEmailData?.users?.find(u => u.email === 'admin@targetavaliacoes.com');
      if (adminUser) {
        await supabase.auth.admin.deleteUser(adminUser.id);
      }
      
      const restaurantUser = adminEmailData?.users?.find(u => u.email === 'restaurante@teste.com');
      if (restaurantUser) {
        await supabase.auth.admin.deleteUser(restaurantUser.id);
      }
    } catch (error) {
      console.error('Erro ao remover usuários existentes:', error);
    }

    // Criar usuário administrador
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@targetavaliacoes.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: { name: 'Administrador' }
    });

    if (adminError) {
      console.error('Erro ao criar usuário admin:', adminError);
    } else {
      // Inserir na tabela admin_users
      await supabase.from('admin_users').upsert({
        id: adminData.user.id,
        email: adminData.user.email,
        name: 'Administrador',
        role: 'admin'
      });
    }

    // Criar usuário do restaurante
    const { data: restaurantData, error: restaurantError } = await supabase.auth.admin.createUser({
      email: 'restaurante@teste.com',
      password: 'teste123',
      email_confirm: true,
      user_metadata: { name: 'Restaurante Teste' }
    });

    if (restaurantError) {
      console.error('Erro ao criar usuário restaurante:', restaurantError);
    } else {
      // Inserir informações do restaurante em tabela específica, se necessário
      await supabase.from('restaurants').upsert({
        id: restaurantData.user.id,
        name: 'Restaurante Teste',
        owner_name: 'Dono do Restaurante',
        email: restaurantData.user.email,
        subscription_status: 'active',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 dias a partir de agora
      });
    }

    // Return success response
    return new Response(
      JSON.stringify({
        message: 'Usuários de teste criados com sucesso',
        admin: adminError ? null : { id: adminData.user.id, email: adminData.user.email },
        restaurant: restaurantError ? null : { id: restaurantData.user.id, email: restaurantData.user.email }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    );
  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response(
      JSON.stringify({ error: 'Ocorreu um erro inesperado' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
