
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Calendar, Download, Save, Trash, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, Waiter } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper to map database fields to client model
const mapRestaurantFromDb = (dbRestaurant: any): Restaurant => {
  return {
    id: dbRestaurant.id,
    name: dbRestaurant.name,
    googleReviewUrl: dbRestaurant.google_review_url,
    responsible_name: dbRestaurant.responsible_name,
    responsible_email: dbRestaurant.responsible_email,
    responsible_phone: dbRestaurant.responsible_phone,
    totalReviews: dbRestaurant.total_reviews,
    initialRating: dbRestaurant.initial_rating,
    currentRating: dbRestaurant.current_rating,
    positiveFeedback: dbRestaurant.positive_feedback,
    negativeFeedback: dbRestaurant.negative_feedback,
    plan_status: dbRestaurant.plan_status,
    plan_expiry_date: dbRestaurant.plan_expiry_date,
    created_at: dbRestaurant.created_at,
    updated_at: dbRestaurant.updated_at
  };
};

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [waiters, setWaiters] = useState<Waiter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    google_review_url: '',
    responsible_name: '',
    responsible_email: '',
    responsible_phone: '',
    plan_status: 'trial',
  });

  useEffect(() => {
    if (id) {
      fetchRestaurantData();
    }
  }, [id]);

  const fetchRestaurantData = async () => {
    setIsLoading(true);
    try {
      // Fetch restaurant details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (restaurantError) throw restaurantError;

      const mappedRestaurant = mapRestaurantFromDb(restaurantData);
      setRestaurant(mappedRestaurant);
      setFormData({
        name: restaurantData.name,
        google_review_url: restaurantData.google_review_url,
        responsible_name: restaurantData.responsible_name || '',
        responsible_email: restaurantData.responsible_email || '',
        responsible_phone: restaurantData.responsible_phone || '',
        plan_status: restaurantData.plan_status || 'trial',
      });

      // Fetch restaurant's waiters
      const { data: waitersData, error: waitersError } = await supabase
        .from('waiters')
        .select('*')
        .eq('restaurant_id', id);

      if (waitersError) throw waitersError;
      setWaiters(waitersData || []);

    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao buscar dados do restaurante',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('restaurants')
        .update({
          name: formData.name,
          google_review_url: formData.google_review_url,
          responsible_name: formData.responsible_name || null,
          responsible_email: formData.responsible_email || null,
          responsible_phone: formData.responsible_phone || null,
          plan_status: formData.plan_status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Informações do restaurante atualizadas com sucesso',
      });

      // Refresh restaurant data
      fetchRestaurantData();

    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar informações do restaurante',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return 'Data inválida';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Detalhes do Restaurante">
        <div className="flex justify-center items-center py-20">
          <p>Carregando...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!restaurant) {
    return (
      <AdminLayout title="Restaurante não encontrado">
        <div className="flex flex-col items-center py-20">
          <p className="mb-4">O restaurante solicitado não foi encontrado.</p>
          <Button onClick={() => navigate('/admin/restaurants')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a lista
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Detalhes do Restaurante">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/restaurants')} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h2 className="text-lg font-medium">{restaurant.name}</h2>
          <p className="text-sm text-gray-500">
            ID: {restaurant.id}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="waiters">Garçons</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Restaurante</CardTitle>
              <CardDescription>Edite os dados do restaurante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Restaurante</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="google_review_url">URL do Google Review</Label>
                  <Input
                    id="google_review_url"
                    name="google_review_url"
                    value={formData.google_review_url}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="responsible_name">Nome do Responsável</Label>
                  <Input
                    id="responsible_name"
                    name="responsible_name"
                    value={formData.responsible_name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="responsible_email">Email do Responsável</Label>
                  <Input
                    id="responsible_email"
                    name="responsible_email"
                    type="email"
                    value={formData.responsible_email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="responsible_phone">Telefone do Responsável</Label>
                  <Input
                    id="responsible_phone"
                    name="responsible_phone"
                    value={formData.responsible_phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plan_status">Status do Plano</Label>
                  <Select 
                    value={formData.plan_status} 
                    onValueChange={(value) => setFormData({...formData, plan_status: value})}
                  >
                    <SelectTrigger id="plan_status">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                      <SelectItem value="canceled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                <p>Criado em: {formatDate(restaurant.created_at)}</p>
                <p>Última atualização: {formatDate(restaurant.updated_at)}</p>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="waiters">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Garçons</CardTitle>
                  <CardDescription>Lista de garçons deste restaurante</CardDescription>
                </div>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Garçom
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {waiters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Este restaurante ainda não possui garçons cadastrados.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Cliques</TableHead>
                      <TableHead className="text-right">Conversões</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waiters.map((waiter) => (
                      <TableRow key={waiter.id}>
                        <TableCell className="font-medium">{waiter.name}</TableCell>
                        <TableCell>
                          <div>{waiter.email}</div>
                          <div className="text-gray-500 text-sm">{waiter.whatsapp}</div>
                        </TableCell>
                        <TableCell>
                          {waiter.is_active ? 
                            <Badge className="bg-green-500">Ativo</Badge> : 
                            <Badge className="bg-gray-500">Inativo</Badge>}
                        </TableCell>
                        <TableCell className="text-right">{waiter.clicks}</TableCell>
                        <TableCell className="text-right">{waiter.conversions || 0}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Cliques</CardTitle>
                <CardDescription>Total de cliques e conversões</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total de cliques:</span>
                  <span className="font-bold">{waiters.reduce((sum, w) => sum + w.clicks, 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total de conversões:</span>
                  <span className="font-bold">{waiters.reduce((sum, w) => sum + (w.conversions || 0), 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taxa de conversão:</span>
                  <span className="font-bold">
                    {waiters.reduce((sum, w) => sum + w.clicks, 0) > 0 ? 
                      `${Math.round((waiters.reduce((sum, w) => sum + (w.conversions || 0), 0) / 
                       waiters.reduce((sum, w) => sum + w.clicks, 0)) * 100)}%` : 
                      '0%'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Dados
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Informações do Plano</CardTitle>
                <CardDescription>Status e detalhes da assinatura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Status atual:</p>
                  <div className="mt-1">
                    {formData.plan_status === 'active' && <Badge className="bg-green-500">Ativo</Badge>}
                    {formData.plan_status === 'trial' && <Badge className="bg-blue-500">Trial</Badge>}
                    {formData.plan_status === 'expired' && <Badge className="bg-red-500">Expirado</Badge>}
                    {formData.plan_status === 'canceled' && <Badge className="bg-gray-500">Cancelado</Badge>}
                  </div>
                </div>
                
                {restaurant.plan_expiry_date && (
                  <div>
                    <p className="text-sm font-medium">Expira em:</p>
                    <p className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(restaurant.plan_expiry_date)}
                    </p>
                  </div>
                )}
                
                <div className="pt-2">
                  <Label htmlFor="change_plan">Alterar Status do Plano</Label>
                  <div className="flex space-x-2 mt-2">
                    <Select 
                      value={formData.plan_status} 
                      onValueChange={(value) => setFormData({...formData, plan_status: value})}
                    >
                      <SelectTrigger id="change_plan" className="flex-1">
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="expired">Expirado</SelectItem>
                        <SelectItem value="canceled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Salvando...' : 'Aplicar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Ações</CardTitle>
              <CardDescription>Ações adicionais para este restaurante</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar Relatório CSV
              </Button>
              
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Gerar PDF para Cliente
              </Button>
              
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Excluir Restaurante
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default RestaurantDetail;
