
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
    console.log("Função update-payment-status iniciada");
    const { paymentIntentId, setupIntentId, paymentType, priceId } = await req.json();
    
    if (!paymentIntentId && !setupIntentId) {
      throw new Error("É necessário fornecer um paymentIntentId ou setupIntentId");
    }
    
    // Usar o cliente Supabase para autenticação do usuário
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    // Obter o token de autorização e validar o usuário
    const authHeader = req.headers.get("Authorization")!;
    if (!authHeader) {
      throw new Error("Header de autorização ausente");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("Usuário não autenticado ou email não disponível");
    }
    
    // Inicializar Stripe com a chave secreta
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Variável de ambiente STRIPE_SECRET_KEY não configurada");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Verificar e atualizar o status do pagamento
    if (paymentType === "payment" && paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === "succeeded") {
        await supabaseServiceClient.from("subscribers").update({
          subscription_status: "active",
          ends_at: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString(), // 1 ano a partir de agora
          updated_at: new Date().toISOString()
        }).eq("user_id", user.id);
        
        return new Response(JSON.stringify({ 
          success: true,
          status: "active",
          message: "Pagamento processado com sucesso" 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        status: paymentIntent.status,
        message: "Pagamento ainda não foi finalizado" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else if (paymentType === "subscription" && setupIntentId && priceId) {
      const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
      
      if (setupIntent.status === "succeeded") {
        // Criar assinatura com o método de pagamento confirmado
        const subscription = await stripe.subscriptions.create({
          customer: setupIntent.customer,
          items: [{ price: priceId }],
          default_payment_method: setupIntent.payment_method,
          metadata: setupIntent.metadata
        });
        
        if (subscription.status === "active") {
          await supabaseServiceClient.from("subscribers").update({
            subscription_status: "active",
            ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }).eq("user_id", user.id);
          
          return new Response(JSON.stringify({ 
            success: true,
            status: "active",
            message: "Assinatura ativada com sucesso" 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }
      
      return new Response(JSON.stringify({ 
        success: false,
        status: setupIntent.status,
        message: "Configuração de pagamento ainda não foi finalizada" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    throw new Error("Tipo de pagamento desconhecido ou parâmetros inválidos");
  } catch (error) {
    console.error("ERRO:", error instanceof Error ? error.message : String(error));
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
