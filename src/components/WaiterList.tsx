
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Waiter } from '@/types';
import { QRCode } from './QRCode';
import { useToast } from "@/components/ui/use-toast";
import { QrCode as QrCodeIcon } from "lucide-react";

interface WaiterListProps {
  waiters: Waiter[];
  onDelete: (id: string) => void;
}

export const WaiterList = ({ waiters, onDelete }: WaiterListProps) => {
  const [selectedWaiter, setSelectedWaiter] = useState<Waiter | null>(null);
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este garçom?')) {
      onDelete(id);
      toast({
        title: "Garçom removido",
        description: "O garçom foi removido da sua lista.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {waiters.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Nenhum garçom adicionado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waiters.map(waiter => (
              <Card key={waiter.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <CardTitle className="text-lg font-medium">{waiter.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Email:</span> {waiter.email}</p>
                    <p className="text-sm"><span className="font-medium">WhatsApp:</span> {waiter.whatsapp}</p>
                    <p className="text-sm"><span className="font-medium">Cliques:</span> {waiter.clicks}</p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <Button variant="outline" onClick={() => setSelectedWaiter(waiter)}>
                        <QrCodeIcon className="h-4 w-4 mr-2" />
                        Ver QR Code
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(waiter.id)}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedWaiter && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="p-4">
                  <QRCode 
                    waiterName={selectedWaiter.name}
                    qrCodeUrl={selectedWaiter.qrCodeUrl}
                    trackingLink={selectedWaiter.trackingLink}
                  />
                </div>
                <div className="p-4 border-t flex justify-end">
                  <Button variant="ghost" onClick={() => setSelectedWaiter(null)}>Fechar</Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
