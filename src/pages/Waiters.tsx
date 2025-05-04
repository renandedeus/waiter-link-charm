
import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { Sidebar } from '@/components/Sidebar';
import WaiterManagement from '@/components/dashboard/WaiterManagement';
import { Waiter } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { createWaiter, deleteWaiter, getWaiters } from '@/services/waiterService';

const Waiters = () => {
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchWaiters = async () => {
      try {
        if (user?.id) {
          setLoading(true);
          const fetchedWaiters = await getWaiters(user.id);
          setWaiters(fetchedWaiters);
        }
      } catch (error) {
        console.error('Erro ao carregar garçons:', error);
        toast({
          title: "Erro ao carregar garçons",
          description: "Ocorreu um problema ao carregar a lista de garçons.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWaiters();
  }, [user, toast]);

  const handleAddWaiter = async (name: string, email: string, whatsapp: string) => {
    try {
      if (!user?.id) return Promise.reject("Usuário não autenticado");
      
      const newWaiter = await createWaiter({
        name,
        email,
        whatsapp,
        restaurantId: user.id
      });
      
      setWaiters(prev => [...prev, newWaiter]);
      toast({
        title: "Garçom adicionado",
        description: "O garçom foi adicionado com sucesso.",
      });
      
      return newWaiter;
    } catch (error) {
      console.error('Erro ao adicionar garçom:', error);
      throw error;
    }
  };

  const handleDeleteWaiter = async (id: string) => {
    try {
      await deleteWaiter(id);
      setWaiters(prev => prev.filter(waiter => waiter.id !== id));
      toast({
        title: "Garçom removido",
        description: "O garçom foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir garçom:', error);
      throw error;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activePage="waiters" 
        onNavigate={() => {}} 
      />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Gerenciamento de Garçons</h1>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <WaiterManagement 
              waiters={waiters}
              onAddWaiter={handleAddWaiter}
              onDeleteWaiter={handleDeleteWaiter}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Waiters;
