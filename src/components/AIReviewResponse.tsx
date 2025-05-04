
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface AIReviewResponseProps {
  reviewContent: string;
  rating: number;
  onResponseGenerated: (response: string) => void;
}

const AIReviewResponse: React.FC<AIReviewResponseProps> = ({ 
  reviewContent, 
  rating, 
  onResponseGenerated 
}) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const { toast } = useToast();

  const generateAIResponse = async () => {
    setLoading(true);
    
    try {
      // Em uma implementação real, isso chamaria uma função Edge do Supabase com integração OpenAI
      // Para demonstração, vamos simular uma resposta
      
      // Simular tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Resposta simulada baseada na classificação
      let aiResponse = '';
      
      if (rating >= 4) {
        aiResponse = `Olá! Muito obrigado pelo seu feedback tão positivo! Ficamos extremamente felizes em saber que você teve uma experiência agradável conosco. Seu comentário nos motiva a continuar oferecendo o melhor serviço possível. Esperamos vê-lo novamente em breve!`;
      } else if (rating === 3) {
        aiResponse = `Olá! Agradecemos por compartilhar sua experiência conosco. Seu feedback é muito importante para nos ajudar a melhorar. Gostaríamos de saber mais sobre como poderíamos ter tornado sua visita mais especial. Esperamos ter a oportunidade de superar suas expectativas na próxima vez!`;
      } else {
        aiResponse = `Olá! Pedimos sinceras desculpas por não termos atendido às suas expectativas. Seu feedback é extremamente valioso e tomaremos medidas imediatas para resolver os problemas mencionados. Gostaríamos de convidá-lo a nos dar uma nova chance para demonstrar nosso compromisso com a excelência. Por favor, entre em contato conosco diretamente para que possamos trabalhar em uma solução personalizada.`;
      }
      
      setResponse(aiResponse);
      onResponseGenerated(aiResponse);
      
      toast({
        title: "Resposta gerada com sucesso",
        description: "A resposta para a avaliação foi gerada pela IA.",
        variant: "success"
      });
      
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
      toast({
        title: "Erro ao gerar resposta",
        description: "Não foi possível gerar uma resposta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // Permite editar a resposta gerada
    onResponseGenerated(response);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resposta com IA</CardTitle>
      </CardHeader>
      <CardContent>
        {response ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm">{response}</p>
            </div>
            <Textarea 
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="min-h-[120px]"
              placeholder="Edite a resposta gerada pela IA..."
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Gere uma resposta personalizada para esta avaliação usando inteligência artificial
            </p>
            <p className="text-sm text-gray-400 mb-4">
              A resposta será baseada no conteúdo da avaliação e na classificação recebida
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {response ? (
          <Button onClick={handleEdit}>Salvar edições</Button>
        ) : (
          <Button onClick={generateAIResponse} disabled={loading} className="w-full">
            {loading ? "Gerando resposta..." : "Gerar resposta com IA"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AIReviewResponse;
