
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
    
    // Parse request body safely
    let body;
    try {
      body = await req.json();
      console.log("Corpo da requisição:", JSON.stringify(body));
    } catch (e) {
      console.error("Erro ao parsear corpo da requisição:", e);
      throw new Error("Corpo da requisição inválido");
    }
    
    const { paymentIntentId, setupIntentId, paymentType, priceId } = body;
    
    if (!paymentIntentId && !setupIntentId) {
      throw new Error("É necessário fornecer um paymentIntentId ou setupIntentId");
    }
    
    // Usar o cliente Supabase para autenticação do usuário
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Configuração do Supabase ausente");
      throw new Error("Configuração do servidor incompleta");
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Obter o token de autorização e validar o usuário
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      console.error("Header de autorização ausente");
      throw new Error("Header de autorização ausente");
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Token obtido, autenticando usuário");
    
    const { data, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error("Erro na autenticação:", userError);
      throw new Error(`Erro na autenticação: ${userError.message}`);
    }
    
    const user = data.user;
    
    if (!user?.email) {
      console.error("Usuário não autenticado ou email não disponível");
      throw new Error("Usuário não autenticado ou email não disponível");
    }
    
    console.log("Usuário autenticado:", user.email);
    
    // Inicializar Stripe com a chave secreta
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY não configurada");
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
      console.log("Verificando Payment Intent:", paymentIntentId);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.log("Status do Payment Intent:", paymentIntent.status);
      
      if (paymentIntent.status === "succeeded") {
        console.log("Pagamento bem-sucedido, atualizando assinatura");
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
      console.log("Verificando Setup Intent:", setupIntentId);
      const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
      console.log("Status do Setup Intent:", setupIntent.status);
      
      if (setupIntent.status === "succeeded") {
        // Criar assinatura com o método de pagamento confirmado
        console.log("Setup Intent bem-sucedido, criando assinatura");
        try {
          const subscription = await stripe.subscriptions.create({
            customer: setupIntent.customer,
            items: [{ price: priceId }],
            default_payment_method: setupIntent.payment_method,
            metadata: setupIntent.metadata
          });
          
          console.log("Assinatura criada:", subscription.id, "status:", subscription.status);
          
          if (subscription.status === "active") {
            console.log("Assinatura ativa, atualizando banco de dados");
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
        } catch (subsError) {
          console.error("Erro ao criar assinatura:", subsError);
          throw new Error(`Erro ao criar assinatura: ${subsError.message || String(subsError)}`);
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
    console.error("Stack trace:", error instanceof Error ? error.stack : "Sem stack trace");
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
