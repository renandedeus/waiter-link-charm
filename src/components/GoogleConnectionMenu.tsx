import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
const GoogleConnectionMenu = () => {
  const {
    toast
  } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const handleConnect = async () => {
    setIsConnecting(true);

    // Simulação de conexão com o Google
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      toast({
        title: "Conta Google conectada",
        description: "Sua conta Google foi conectada com sucesso. Agora podemos acessar as avaliações do seu negócio.",
        variant: "success"
      });
    }, 2000);

    // Aqui seria implementada a autenticação real com o Google usando OAuth
  };
  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Conta Google desconectada",
      description: "Sua conta Google foi desconectada."
    });

    // Aqui seria implementada a desconexão real da conta do Google
  };
  return <Card>
      <CardHeader>
        <CardTitle>Conexão com o Google</CardTitle>
        <CardDescription>
          Conecte sua conta do Google para acessar as avaliações do seu negócio no Google
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {isConnected ? <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-green-900">Conta Google conectada</h4>
                <p className="text-sm text-green-700 mt-1">
                  Sua conta está conectada e podemos acessar as avaliações do seu negócio.
                </p>
              </div>
            </div> : <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">Conta Google não conectada</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Conecte sua conta do Google para que possamos acessar as avaliações do seu negócio.
                </p>
              </div>
            </div>}
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Ao conectar sua conta do Google, você permite que acessemos as avaliações do seu negócio no Google My Business.
              Isso nos permite mostrar métricas e tendências de avaliações ao longo do tempo.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        {isConnected ? <Button variant="outline" onClick={handleDisconnect}>
            Desconectar conta
          </Button> : <Button onClick={handleConnect} disabled={isConnecting} className="">
            {isConnecting ? "Conectando..." : "Conectar conta Google"}
          </Button>}
      </CardFooter>
    </Card>;
};
export default GoogleConnectionMenu;