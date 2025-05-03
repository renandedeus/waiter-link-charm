
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Configurações salvas',
        description: 'As alterações foram aplicadas com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout title="Configurações">
      <div className="mb-6">
        <h2 className="text-lg font-medium">Configurações do Sistema</h2>
        <p className="text-sm text-gray-500">
          Personalize as configurações gerais da plataforma
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Ajuste as configurações básicas do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="system-name">Nome do Sistema</Label>
                <Input id="system-name" defaultValue="Waiter Link" />
                <p className="text-xs text-gray-500">
                  Nome exibido no cabeçalho e no rodapé da aplicação
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email de Contato</Label>
                <Input id="contact-email" type="email" defaultValue="suporte@waiterlink.com" />
                <p className="text-xs text-gray-500">
                  Email usado para receber notificações e contatos dos usuários
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-lang">Idioma Padrão</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger id="default-lang">
                    <SelectValue placeholder="Selecione um idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Idioma padrão usado na interface
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notificações por Email</Label>
                  <p className="text-xs text-gray-500">
                    Receber notificações de sistema por email
                  </p>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Acessibilidade</CardTitle>
              <CardDescription>
                Configure opções de acessibilidade para melhorar a experiência do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="high-contrast">Alto Contraste</Label>
                  <p className="text-xs text-gray-500">
                    Aumenta o contraste entre texto e fundo
                  </p>
                </div>
                <Switch id="high-contrast" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="larger-text">Texto Ampliado</Label>
                  <p className="text-xs text-gray-500">
                    Aumenta o tamanho do texto em toda a aplicação
                  </p>
                </div>
                <Switch id="larger-text" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="screen-reader">Suporte a Leitores de Tela</Label>
                  <p className="text-xs text-gray-500">
                    Otimiza a interface para leitores de tela
                  </p>
                </div>
                <Switch id="screen-reader" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reduced-motion">Reduzir Animações</Label>
                  <p className="text-xs text-gray-500">
                    Remove ou reduz animações da interface
                  </p>
                </div>
                <Switch id="reduced-motion" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="font-family">Família de Fonte</Label>
                <Select defaultValue="system">
                  <SelectTrigger id="font-family">
                    <SelectValue placeholder="Selecione uma fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">Fonte do Sistema</SelectItem>
                    <SelectItem value="sans">Sans-Serif (Acessível)</SelectItem>
                    <SelectItem value="dyslexic">Fonte para Dislexia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Backup</CardTitle>
              <CardDescription>
                Configure o sistema de backup automático de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-backup">Backup Automático</Label>
                  <p className="text-xs text-gray-500">
                    Ativar backup automático de dados
                  </p>
                </div>
                <Switch id="auto-backup" defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Frequência do Backup</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="backup-frequency">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">A cada hora</SelectItem>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backup-retention">Período de Retenção</Label>
                <Select defaultValue="30">
                  <SelectTrigger id="backup-retention">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="365">365 dias</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Tempo que os backups serão mantidos
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backup-email">Email para Notificações</Label>
                <Input id="backup-email" type="email" defaultValue="admin@waiterlink.com" />
                <p className="text-xs text-gray-500">
                  Receba notificações sobre backups realizados ou falhas
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">Executar Backup Agora</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>
                Configure opções de segurança da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="token-expiry">Expiração de Tokens dos Garçons</Label>
                <Select defaultValue="never">
                  <SelectTrigger id="token-expiry">
                    <SelectValue placeholder="Selecione um período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="365">365 dias</SelectItem>
                    <SelectItem value="never">Nunca expirar</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Tempo até que os links dos garçons expirem
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ip-protection">Proteção contra Crawlers</Label>
                  <p className="text-xs text-gray-500">
                    Limita acessos repetidos de um mesmo IP
                  </p>
                </div>
                <Switch id="ip-protection" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="log-access">Registrar Acessos</Label>
                  <p className="text-xs text-gray-500">
                    Mantém logs de todos os acessos ao sistema
                  </p>
                </div>
                <Switch id="log-access" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="log-actions">Registrar Ações</Label>
                  <p className="text-xs text-gray-500">
                    Mantém logs de todas as ações importantes no sistema
                  </p>
                </div>
                <Switch id="log-actions" defaultChecked />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="log-retention">Retenção de Logs</Label>
                <Select defaultValue="90">
                  <SelectTrigger id="log-retention">
                    <SelectValue placeholder="Selecione um período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="180">180 dias</SelectItem>
                    <SelectItem value="365">365 dias</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Tempo que os logs serão mantidos no sistema
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Settings;
