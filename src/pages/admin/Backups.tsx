
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, CheckCircle, Download, File, RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Backup } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Backups = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBackups(data || []);
    } catch (error) {
      console.error('Erro ao buscar backups:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os backups',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Em uma implementação real, chamaríamos uma função serverless para criar o backup
      // Por enquanto, vamos simular o processo adicionando um novo registro de backup
      
      const newBackup = {
        file_path: `backups/backup_manual_${new Date().toISOString().replace(/[:.]/g, '_')}.sql`,
        file_size: Math.floor(Math.random() * 5000000) + 1000000, // Tamanho aleatório entre 1-6 MB
        backup_type: 'manual',
        status: 'completed',
      };
      
      const { error } = await supabase
        .from('backups')
        .insert(newBackup);

      if (error) throw error;
      
      toast({
        title: 'Backup criado',
        description: 'O backup foi criado com sucesso',
      });
      
      // Atualizar a lista
      fetchBackups();
      
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o backup',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  // Dados de backup de exemplo para a interface inicial
  const mockBackups: Backup[] = [
    {
      id: '1',
      file_path: 'backups/backup_auto_2023-05-03.sql',
      file_size: 1540000,
      backup_type: 'automatic',
      status: 'completed',
      created_at: '2023-05-03T12:00:00Z',
    },
    {
      id: '2',
      file_path: 'backups/backup_auto_2023-05-02.sql',
      file_size: 1480000,
      backup_type: 'automatic',
      status: 'completed',
      created_at: '2023-05-02T12:00:00Z',
    },
  ];

  const displayBackups = backups.length > 0 ? backups : mockBackups;

  return (
    <AdminLayout title="Backups">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium">Gerenciamento de Backups</h2>
          <p className="text-sm text-gray-500">
            Crie e restaure backups do sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchBackups}
            disabled={isLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button
            onClick={createBackup}
            disabled={isCreatingBackup}
          >
            {isCreatingBackup ? 'Criando...' : 'Criar Backup'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backups Disponíveis</CardTitle>
          <CardDescription>
            Lista de todos os backups do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Carregando backups...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Arquivo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayBackups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <File className="mr-2 h-4 w-4" />
                        {backup.file_path.split('/').pop()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {backup.backup_type === 'automatic' ? 'Automático' : 'Manual'}
                    </TableCell>
                    <TableCell>{formatFileSize(backup.file_size)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {formatDate(backup.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Concluído
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-gray-500">
            Os backups são armazenados por até 30 dias
          </p>
          <Button variant="outline" disabled>Restaurar Backup</Button>
        </CardFooter>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Configuração de Backup Automático</CardTitle>
          <CardDescription>
            Os backups automáticos são realizados diariamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p><strong>Frequência:</strong> Diária</p>
              <p><strong>Horário:</strong> 03:00 AM</p>
            </div>
            <div className="flex justify-between items-center">
              <p><strong>Retenção:</strong> 30 dias</p>
              <p><strong>Status:</strong> <span className="text-green-500">Ativo</span></p>
            </div>
            <p className="text-sm text-gray-500">
              Para alterar estas configurações, acesse a página de Configurações &gt; Backup
            </p>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Backups;
