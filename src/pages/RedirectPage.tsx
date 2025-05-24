
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { trackClickAndRedirect } from '@/services/waiterService';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const RedirectPage = () => {
  const { id } = useParams<{ id: string }>();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');

  useEffect(() => {
    const handleRedirect = async () => {
      if (!id) {
        setStatus('error');
        return;
      }

      try {
        const googleUrl = await trackClickAndRedirect(id);
        
        if (googleUrl) {
          setStatus('redirecting');
          // Small delay to show the waiter name, then redirect
          setTimeout(() => {
            window.location.href = googleUrl;
          }, 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error during redirect:', error);
        setStatus('error');
      }
    };

    handleRedirect();
  }, [id]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-center text-gray-600">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'redirecting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Obrigado!</h2>
                <p className="text-gray-600 mb-4">Redirecionando para as avaliações...</p>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Link inválido</h2>
              <p className="text-gray-600">Este link não está mais disponível ou expirou.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedirectPage;
