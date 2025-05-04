
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
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Create an admin client with service role key for user management 
    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    
    // Verificar acesso (usando uma chave secreta apenas para esta função)
    // Em ambiente de desenvolvimento, permitimos uma chave fixa para simplificar testes
    const { adminKey } = await req.json();
    const expectedAdminKey = Deno.env.get('ADMIN_CREATION_KEY') || 'desenvolvimento-apenas';
    
    if (adminKey !== expectedAdminKey) {
      return new Response(
        JSON.stringify({ error: 'Acesso não autorizado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    console.log("Criando usuários de teste...");

    // Remover usuários de teste existentes (para evitar duplicatas)
    try {
      console.log("Buscando usuários existentes...");
      const { data: users, error: findError } = await supabase
        .from('admin_users')
        .select('email');
        
      if (findError) {
        console.error("Erro ao buscar usuários admin existentes:", findError);
      }
      
      const adminEmail = 'admin@targetavaliacoes.com';
      const restaurantEmail = 'restaurante@teste.com';
      
      // Procurar usuários por e-mail
      const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers();
      
      if (searchError) {
        console.error("Erro ao listar usuários existentes:", searchError);
      } else {
        console.log(`Encontrados ${existingUsers?.users.length || 0} usuários no total`);
        
        const adminUser = existingUsers?.users.find(u => u.email === adminEmail);
        const restaurantUser = existingUsers?.users.find(u => u.email === restaurantEmail);
        
        if (adminUser) {
          console.log(`Removendo usuário admin existente: ${adminEmail} (${adminUser.id})`);
          await supabase.auth.admin.deleteUser(adminUser.id);
        }
        
        if (restaurantUser) {
          console.log(`Removendo usuário restaurante existente: ${restaurantEmail} (${restaurantUser.id})`);
          await supabase.auth.admin.deleteUser(restaurantUser.id);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar usuários existentes:', error);
      // Continue even if there's an error when checking
    }

    // Create a small delay to ensure users are properly deleted
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Criar usuário administrador
    console.log("Criando usuário administrador...");
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@targetavaliacoes.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: { name: 'Administrador' }
    });

    if (adminError) {
      console.error('Erro ao criar usuário admin:', adminError);
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário admin: ${adminError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    } else {
      console.log("Usuário admin criado com sucesso:", adminData.user.id);
      
      // Inserir na tabela admin_users
      const { error: insertError } = await supabase.from('admin_users').upsert({
        id: adminData.user.id,
        email: adminData.user.email,
        name: 'Administrador',
        role: 'admin'
      });
      
      if (insertError) {
        console.error('Erro ao inserir admin na tabela admin_users:', insertError);
      } else {
        console.log('Admin inserido na tabela admin_users com sucesso');
      }
    }

    // Create a small delay before creating the next user
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Criar usuário do restaurante
    console.log("Criando usuário do restaurante...");
    const { data: restaurantData, error: restaurantError } = await supabase.auth.admin.createUser({
      email: 'restaurante@teste.com',
      password: 'teste123',
      email_confirm: true,
      user_metadata: { name: 'Restaurante Teste' }
    });

    if (restaurantError) {
      console.error('Erro ao criar usuário restaurante:', restaurantError);
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário restaurante: ${restaurantError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    } else {
      console.log("Usuário restaurante criado com sucesso:", restaurantData.user.id);
      
      // Inserir informações do restaurante em tabela específica
      const { error: insertError } = await supabase.from('restaurants').upsert({
        id: restaurantData.user.id,
        name: 'Restaurante Teste',
        owner_name: 'Dono do Restaurante',
        email: restaurantData.user.email,
        subscription_status: 'active',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 dias a partir de agora
        google_review_url: 'https://g.page/r/CX-xxxxxxx/review' // URL de exemplo para avaliações
      });
      
      if (insertError) {
        console.error('Erro ao inserir dados do restaurante:', insertError);
      } else {
        console.log('Dados do restaurante inseridos com sucesso');
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        message: 'Usuários de teste criados com sucesso',
        admin: { id: adminData.user.id, email: adminData.user.email },
        restaurant: { id: restaurantData.user.id, email: restaurantData.user.email }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
    );
  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response(
      JSON.stringify({ error: `Ocorreu um erro inesperado: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
