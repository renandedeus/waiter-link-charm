
import React, { useState } from 'react';
import { Waiter } from '@/types';
import { WaiterForm } from '@/components/WaiterForm';
import { WaiterList } from '@/components/WaiterList';
import { useToast } from "@/components/ui/use-toast";

interface WaiterManagementProps {
  waiters: Waiter[];
  onAddWaiter: (name: string, email: string, whatsapp: string) => Promise<Waiter>;
  onDeleteWaiter: (id: string) => Promise<void>;
}

const WaiterManagement: React.FC<WaiterManagementProps> = ({
  waiters,
  onAddWaiter,
  onDeleteWaiter
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddWaiter = async (name: string, email: string, whatsapp: string) => {
    try {
      setIsSubmitting(true);
      const newWaiter = await onAddWaiter(name, email, whatsapp);
      return newWaiter;
    } catch (error) {
      console.error('Erro ao adicionar garçom:', error);
      toast({
        title: "Erro ao adicionar garçom",
        description: "Ocorreu um problema ao tentar adicionar o garçom. Por favor, tente novamente.",
        variant: "destructive",
      });
      throw error; // Re-throw for proper error handling in WaiterForm
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWaiter = async (id: string) => {
    try {
      await onDeleteWaiter(id);
    } catch (error) {
      console.error('Erro ao excluir garçom:', error);
      toast({
        title: "Erro ao excluir garçom",
        description: "Ocorreu um problema ao tentar excluir o garçom. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <WaiterForm onSave={handleAddWaiter} />
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-4">Seus Garçons</h2>
        <WaiterList waiters={waiters} onDelete={handleDeleteWaiter} />
      </div>
    </>
  );
};

export default WaiterManagement;
