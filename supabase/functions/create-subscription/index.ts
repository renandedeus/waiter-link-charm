
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
    const { planType } = await req.json();
    
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
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("Usuário não autenticado ou email não disponível");
    }
    
    // Inicializar Stripe com a chave secreta
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Verificar se o cliente já existe no Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Criar um novo cliente no Stripe se não existir
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.name || "Cliente",
        metadata: {
          user_id: user.id
        }
      });
      customerId = customer.id;
    }
    
    // Configurar os parâmetros da sessão de checkout com base no tipo de plano
    let priceData, mode;
    
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
    
    // Criar uma sessão de checkout do Stripe
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
      success_url: `${req.headers.get("origin")}/dashboard?payment_success=true&plan=${planType}`,
      cancel_url: `${req.headers.get("origin")}/payment-gateway?canceled=true`,
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
    
    // Registrar cliente e sessão no serviço de registro do Supabase (opcional)
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
    
    return new Response(JSON.stringify({ url: session.url }), {
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
