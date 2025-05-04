
import React from 'react';
import { Waiter } from '@/types';
import { WaiterForm } from '@/components/WaiterForm';
import { WaiterList } from '@/components/WaiterList';

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
  return (
    <>
      <WaiterForm onSave={onAddWaiter} />
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-4">Seus Garçons</h2>
        <WaiterList waiters={waiters} onDelete={onDeleteWaiter} />
      </div>
    </>
  );
};

export default WaiterManagement;
