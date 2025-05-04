
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
    
    // Parse the request body
    let body;
    try {
      body = await req.json();
      console.log("Corpo da requisição:", JSON.stringify(body));
    } catch (e) {
      console.error("Erro ao parsear corpo da requisição:", e);
      throw new Error("Corpo da requisição inválido");
    }
    
    const { planType } = body;
    
    console.log("Tipo de plano recebido:", planType);
    
    // Validar o tipo de plano
    if (!["mensal", "semestral", "anual"].includes(planType)) {
      throw new Error("Tipo de plano inválido");
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
    console.log("Verificando cabeçalho de autorização");
    
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
    console.log("Inicializando Stripe...");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY não configurada");
      throw new Error("Variável de ambiente STRIPE_SECRET_KEY não configurada");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    
    // Verificar se o cliente já existe no Stripe
    console.log("Verificando cliente no Stripe para:", user.email);
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
    
    // Configurar os valores com base no tipo de plano
    let amount, description, paymentType, interval;
    
    console.log("Configurando dados do plano:", planType);
    switch(planType) {
      case "mensal":
        amount = 9700; // R$97,00
        description = "Plano Mensal - Waiter Link";
        paymentType = "subscription";
        interval = "month";
        break;
      case "semestral":
        amount = 52200; // R$522,00
        description = "Plano Semestral - Waiter Link (6x R$87,00)";
        paymentType = "payment";
        break;
      case "anual":
        amount = 29940; // R$299,40
        description = "Plano Anual - Waiter Link (6x R$49,90)";
        paymentType = "payment";
        break;
    }
    
    let paymentResponse;
    
    if (paymentType === "subscription") {
      // Criar um produto e um preço para a assinatura
      console.log("Criando produto e preço para assinatura");
      const product = await stripe.products.create({
        name: description,
        metadata: {
          user_id: user.id,
          plan_type: planType
        }
      });
      
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: amount,
        currency: "brl",
        recurring: { interval }
      });
      
      // Criar uma intent de configuração de assinatura
      console.log("Criando Setup Intent");
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
        metadata: {
          user_id: user.id,
          plan_type: planType,
          price_id: price.id
        }
      });
      
      paymentResponse = {
        clientSecret: setupIntent.client_secret,
        customerId,
        paymentType: "subscription",
        priceId: price.id,
        amount
      };
    } else {
      // Criar intent de pagamento para pagamentos únicos
      console.log("Criando Payment Intent");
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "brl",
        customer: customerId,
        description,
        metadata: {
          user_id: user.id,
          plan_type: planType
        },
        automatic_payment_methods: {
          enabled: true
        }
      });
      
      paymentResponse = {
        clientSecret: paymentIntent.client_secret,
        customerId,
        paymentType: "payment",
        amount
      };
    }
    
    // Registrar cliente e intenção de pagamento no banco de dados
    console.log("Registrando assinante no banco de dados...");
    const supabaseServiceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    try {
      await supabaseServiceClient.from("subscribers").upsert({
        user_id: user.id,
        email: user.email,
        stripe_customer_id: customerId,
        subscription_status: "pending",
        plan_type: planType,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      console.log("Assinante registrado com sucesso");
    } catch (dbError) {
      console.error("Erro ao gravar no banco de dados:", dbError);
      // Continuar mesmo com erro de BD para não impedir o fluxo de pagamento
    }
    
    console.log("Retornando resposta de sucesso");
    return new Response(JSON.stringify(paymentResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
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
