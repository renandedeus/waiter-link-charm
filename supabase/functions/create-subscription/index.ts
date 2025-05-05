
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
    
    const { planType, installments = 1 } = body;
    
    console.log("Tipo de plano recebido:", planType);
    console.log("Número de parcelas:", installments);
    
    // Validar o tipo de plano
    if (!["mensal", "semestral", "anual"].includes(planType)) {
      throw new Error("Tipo de plano inválido");
    }
    
    // Validar o número de parcelas
    if (planType === "mensal" && installments !== 1) {
      throw new Error("Plano mensal não pode ter parcelas");
    }
    
    if (planType === "semestral" && installments > 6) {
      throw new Error("Plano semestral pode ter no máximo 6 parcelas");
    }
    
    if (planType === "anual" && installments > 12) {
      throw new Error("Plano anual pode ter no máximo 12 parcelas");
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
    console.log("Verificando cabeçalho de autorização:", authHeader ? "Presente" : "Ausente");
    
    if (!authHeader) {
      console.error("Header de autorização ausente");
      return new Response(JSON.stringify({ 
        error: "Header de autorização ausente",
        code: "auth_missing_header"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Token obtido, autenticando usuário");
    
    const { data, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      console.error("Erro na autenticação:", userError);
      return new Response(JSON.stringify({ 
        error: `Erro na autenticação: ${userError.message}`,
        code: "auth_invalid_token",
        message: "Sua sessão expirou ou é inválida. Por favor, faça login novamente."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = data.user;
    
    if (!user?.email) {
      console.error("Usuário não autenticado ou email não disponível");
      return new Response(JSON.stringify({ 
        error: "Usuário não autenticado ou email não disponível",
        code: "auth_no_user_data",
        message: "Não foi possível obter seus dados. Por favor, faça login novamente."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    console.log("Usuário autenticado:", user.email);
    
    // Inicializar Stripe com a chave secreta
    console.log("Inicializando Stripe...");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY não configurada");
      return new Response(JSON.stringify({ 
        error: "Variável de ambiente STRIPE_SECRET_KEY não configurada",
        code: "config_missing_key" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });
    
    // Verificar se o cliente já existe no Stripe
    console.log("Verificando cliente no Stripe para:", user.email);
    try {
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
      let amount, description, paymentType, interval, installmentPlan;
      
      console.log("Configurando dados do plano:", planType);
      switch(planType) {
        case "mensal":
          amount = 9700; // R$97,00
          description = "Plano Mensal - Waiter Link";
          paymentType = "subscription";
          interval = "month";
          installmentPlan = null;
          break;
        case "semestral":
          amount = 52200; // R$522,00
          description = `Plano Semestral - Waiter Link (${installments}x R$${(amount / 100 / installments).toFixed(2)})`;
          paymentType = "payment";
          installmentPlan = {
            enabled: true,
            plan: {
              count: installments,
              interval: 'month',
              type: 'fixed_count'
            }
          };
          break;
        case "anual":
          amount = 80400; // R$804,00
          description = `Plano Anual - Waiter Link (${installments}x R$${(amount / 100 / installments).toFixed(2)})`;
          paymentType = "payment";
          installmentPlan = {
            enabled: true,
            plan: {
              count: installments,
              interval: 'month',
              type: 'fixed_count'
            }
          };
          break;
        default:
          throw new Error("Tipo de plano não reconhecido");
      }
      
      let paymentResponse;
      
      if (paymentType === "subscription") {
        // Criar um produto e um preço para a assinatura
        console.log("Criando produto e preço para assinatura");
        try {
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
            amount,
            installments: 1
          };
        } catch (stripeError) {
          console.error("Erro ao criar produto/preço/setupIntent no Stripe:", stripeError);
          return new Response(JSON.stringify({ 
            error: `Erro no Stripe: ${stripeError.message}`,
            code: "stripe_setup_error"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }
      } else {
        // Criar intent de pagamento para pagamentos únicos com parcelas
        console.log(`Criando Payment Intent com ${installments} parcelas`);
        try {
          // Configuração para pagamentos com parcelas
          const paymentIntentData: any = {
            amount,
            currency: "brl",
            customer: customerId,
            description,
            metadata: {
              user_id: user.id,
              plan_type: planType,
              installments: installments.toString()
            },
            automatic_payment_methods: {
              enabled: true
            }
          };
          
          // Adicionar configuração de parcelas se aplicável
          if (installmentPlan && installments > 1) {
            paymentIntentData.payment_method_options = {
              card: {
                installments: installmentPlan
              }
            };
          }
          
          const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
          
          paymentResponse = {
            clientSecret: paymentIntent.client_secret,
            customerId,
            paymentType: "payment",
            amount,
            installments
          };
        } catch (stripeError) {
          console.error("Erro ao criar paymentIntent no Stripe:", stripeError);
          return new Response(JSON.stringify({ 
            error: `Erro no Stripe: ${stripeError.message}`,
            code: "stripe_payment_error" 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          });
        }
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
          installments: installments,
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
    } catch (stripeListError) {
      console.error("Erro ao listar clientes no Stripe:", stripeListError);
      return new Response(JSON.stringify({ 
        error: `Erro ao verificar cliente no Stripe: ${stripeListError.message}`,
        code: "stripe_customer_error"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error) {
    console.error("ERRO:", error instanceof Error ? error.message : String(error));
    console.error("Stack trace:", error instanceof Error ? error.stack : "Sem stack trace");
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      code: "unknown_error",
      message: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
