
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthRedirect } from '@/hooks/use-auth-redirect';
import AuthTabs from '@/components/auth/AuthTabs';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [infoMessage, setInfoMessage] = useState('');

  // Check for auth redirect/hash parameters in the URL
  useAuthRedirect(setError);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Target Avaliações</CardTitle>
            <CardDescription className="text-center">
              Gerencie avaliações do seu restaurante e motive seus garçons
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthTabs 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              name={name}
              setName={setName}
              error={error}
              setError={setError}
              infoMessage={infoMessage}
              setInfoMessage={setInfoMessage}
              setShowPaymentRedirect={() => {}}
            />
          </CardContent>
          <CardFooter>
            <p className="text-xs text-center text-gray-500 mt-4 w-full">
              Impulsione a satisfação dos clientes com avaliações positivas e motive seus garçons
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
