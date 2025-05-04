
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
    console.log("Função create-subscription iniciada");
    const { planType } = await req.json();
    
    console.log("Tipo de plano recebido:", planType);
    
    // Validar o tipo de plano
    if (!["mensal", "semestral", "anual"].includes(planType)) {
      throw new Error("Tipo de plano inválido");
    }
    
    // Usar o cliente Supabase para autenticação do usuário
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    // Obter o token de autorização e validar o usuário
    const authHeader = req.headers.get("Authorization")!;
    console.log("Autorizando usuário...");
    
    if (!authHeader) {
      throw new Error("Header de autorização ausente");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    console.log("Usuário autenticado:", user?.email);
    
    if (!user?.email) {
      throw new Error("Usuário não autenticado ou email não disponível");
    }
    
    // Inicializar Stripe com a chave secreta
    console.log("Inicializando Stripe...");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Variável de ambiente STRIPE_SECRET_KEY não configurada");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    
    // Verificar se o cliente já existe no Stripe
    console.log("Verificando cliente no Stripe...");
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      console.log("Cliente já existe no Stripe");
      customerId = customers.data[0].id;
    } else {
      // Criar um novo cliente no Stripe se não existir
      console.log("Criando novo cliente no Stripe...");
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.name || "Cliente",
        metadata: {
          user_id: user.id
        }
      });
      customerId = customer.id;
      console.log("Novo cliente criado:", customerId);
    }
    
    // Configurar os parâmetros da sessão de checkout com base no tipo de plano
    let priceData, mode;
    
    console.log("Configurando dados do plano:", planType);
    switch(planType) {
      case "mensal":
        priceData = {
          currency: "brl",
          product_data: { name: "Plano Mensal - Waiter Link" },
          unit_amount: 9700, // R$97,00
          recurring: { interval: "month" }
        };
        mode = "subscription";
        break;
      case "semestral":
        priceData = {
          currency: "brl",
          product_data: { name: "Plano Semestral - Waiter Link" },
          unit_amount: 52200, // R$522,00 (R$87,00 x 6)
        };
        mode = "payment";
        break;
      case "anual":
        priceData = {
          currency: "brl",
          product_data: { name: "Plano Anual - Waiter Link" },
          unit_amount: 29940, // R$299,40 (R$49,90 x 6)
        };
        mode = "payment";
        break;
    }
    
    // Obter origem da requisição ou usar fallback
    const origin = req.headers.get("origin") || "https://waiterlink.app";
    
    // Criar uma sessão de checkout do Stripe
    console.log("Criando sessão de checkout...");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${origin}/dashboard?payment_success=true&plan=${planType}`,
      cancel_url: `${origin}/payment-gateway?canceled=true`,
      payment_intent_data: mode === "payment" ? {
        metadata: {
          user_id: user.id,
          plan_type: planType
        }
      } : undefined,
      subscription_data: mode === "subscription" ? {
        metadata: {
          user_id: user.id,
          plan_type: planType
        }
      } : undefined,
    });
    
    console.log("Sessão de checkout criada:", session.id);
    console.log("URL de checkout:", session.url);
    
    // Registrar cliente e sessão no serviço de registro do Supabase
    console.log("Registrando assinante no banco de dados...");
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    await supabaseServiceClient.from("subscribers").upsert({
      user_id: user.id,
      email: user.email,
      stripe_customer_id: customerId,
      subscription_status: "pending",
      plan_type: planType,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    console.log("Assinante registrado com sucesso");
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("ERRO:", error instanceof Error ? error.message : String(error));
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
