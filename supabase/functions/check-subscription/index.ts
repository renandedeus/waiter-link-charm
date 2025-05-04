
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Usar o cliente Supabase para autenticação do usuário
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    // Obter o token de autorização e validar o usuário
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("Usuário não autenticado ou email não disponível");
    }

    // Usar o cliente de serviço para acessar o banco de dados
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Buscar informações da assinatura no banco de dados
    const { data: subscriptionData } = await supabaseServiceClient
      .from("subscribers")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    // Se não encontrar assinatura, retornar status não assinante
    if (!subscriptionData) {
      return new Response(JSON.stringify({
        isSubscribed: false,
        plan: null,
        status: "not_found"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Inicializar Stripe com a chave secreta
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Se tiver um customerId do Stripe, verificar status real no Stripe
    if (subscriptionData.stripe_customer_id) {
      const customers = await stripe.customers.list({ 
        email: user.email, 
        limit: 1 
      });
      
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        
        // Verificar assinaturas ativas para assinaturas recorrentes
        if (subscriptionData.plan_type === "mensal") {
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: "active",
            limit: 1
          });
          
          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            
            // Atualizar status no banco
            await supabaseServiceClient
              .from("subscribers")
              .update({
                subscription_status: "active",
                ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", user.id);
            
            return new Response(JSON.stringify({
              isSubscribed: true,
              plan: subscriptionData.plan_type,
              status: "active",
              ends_at: new Date(subscription.current_period_end * 1000).toISOString()
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        } 
        // Para planos não recorrentes (semestral/anual), verificar pagamentos bem-sucedidos
        else {
          const paymentIntents = await stripe.paymentIntents.list({
            customer: customer.id,
            limit: 10
          });
          
          const successfulPayment = paymentIntents.data.find(pi => 
            pi.status === "succeeded" && 
            pi.metadata?.plan_type === subscriptionData.plan_type
          );
          
          if (successfulPayment) {
            // Calcular data de expiração baseada no tipo de plano
            const paymentDate = new Date(successfulPayment.created * 1000);
            let expiryDate;
            
            if (subscriptionData.plan_type === "semestral") {
              expiryDate = new Date(paymentDate);
              expiryDate.setMonth(expiryDate.getMonth() + 6);
            } else if (subscriptionData.plan_type === "anual") {
              expiryDate = new Date(paymentDate);
              expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            }
            
            // Verificar se ainda está no período válido
            if (expiryDate && expiryDate > new Date()) {
              // Atualizar status no banco
              await supabaseServiceClient
                .from("subscribers")
                .update({
                  subscription_status: "active",
                  ends_at: expiryDate.toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq("user_id", user.id);
              
              return new Response(JSON.stringify({
                isSubscribed: true,
                plan: subscriptionData.plan_type,
                status: "active",
                ends_at: expiryDate.toISOString()
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
              });
            }
          }
        }
      }
    }
    
    // Se chegou até aqui, não há assinatura ativa válida
    return new Response(JSON.stringify({
      isSubscribed: false,
      plan: subscriptionData.plan_type,
      status: subscriptionData.subscription_status || "inactive"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
