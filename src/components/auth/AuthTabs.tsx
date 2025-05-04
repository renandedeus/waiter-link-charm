
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

type AuthTabsProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  error: string;
  setError: (error: string) => void;
  infoMessage: string;
  setInfoMessage: (message: string) => void;
  setShowPaymentRedirect: (show: boolean) => void;
};

const AuthTabs = ({
  activeTab,
  setActiveTab,
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  error,
  setError,
  infoMessage,
  setInfoMessage,
  setShowPaymentRedirect,
}: AuthTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 mb-6">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Cadastro</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          infoMessage={infoMessage}
          error={error}
        />
      </TabsContent>
      
      <TabsContent value="signup">
        <SignupForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          name={name}
          setName={setName}
          setShowPaymentRedirect={setShowPaymentRedirect}
          setActiveTab={setActiveTab}
          error={error}
          setError={setError}
          setInfoMessage={setInfoMessage}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AuthTabs;
