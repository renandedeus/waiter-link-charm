
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Search, PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types';
import { Badge } from '@/components/ui/badge';

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
    updated_at: dbRestaurant.updated_at,
    waiter_count: dbRestaurant.waiter_count
  };
};

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;
  const { toast } = useToast();

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('restaurants')
        .select('*, waiters(count)')
        .order('name', { ascending: true })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      if (statusFilter) {
        query = query.eq('plan_status', statusFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform the data format
      const formattedData = data.map(restaurant => mapRestaurantFromDb({
        ...restaurant,
        waiter_count: restaurant.waiters?.[0]?.count || 0
      }));

      setRestaurants(formattedData);
      
      // Get total count for pagination
      const { count: totalCount } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true });

      setTotalCount(totalCount || 0);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao buscar restaurantes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchRestaurants();
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>;
      case 'trial':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'expired':
        return <Badge className="bg-red-500">Expirado</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-500">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <AdminLayout title="Restaurantes">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-800">
            Lista de Restaurantes
          </h2>
          <p className="text-sm text-gray-500">
            Gerenciar todos os restaurantes cadastrados na plataforma
          </p>
        </div>
        
        <Button asChild>
          <Link to="/admin/restaurants/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Restaurante
          </Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-md border mb-6">
        <div className="p-4 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <Input
                placeholder="Buscar restaurante..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
              <Button type="submit" variant="ghost" size="icon">
                <Search className="h-4 w-4" />
                <span className="sr-only">Buscar</span>
              </Button>
            </form>
            
            <div>
              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Garçons</TableHead>
                <TableHead className="text-right">Avaliações</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : restaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Nenhum restaurante encontrado
                  </TableCell>
                </TableRow>
              ) : (
                restaurants.map((restaurant) => (
                  <TableRow key={restaurant.id}>
                    <TableCell className="font-medium">{restaurant.name}</TableCell>
                    <TableCell>{restaurant.responsible_name || 'Não informado'}</TableCell>
                    <TableCell>{getStatusBadge(restaurant.plan_status)}</TableCell>
                    <TableCell>{restaurant.waiter_count}</TableCell>
                    <TableCell className="text-right">{restaurant.totalReviews || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/restaurants/${restaurant.id}`}>
                          Detalhes
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {totalCount > 0 ? 
              `Mostrando ${Math.min((page - 1) * PAGE_SIZE + 1, totalCount)}-${Math.min(page * PAGE_SIZE, totalCount)} de ${totalCount}` : 
              'Nenhum resultado'}
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page - 1)}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm">
              Página {page} de {totalPages || 1}
            </p>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Restaurants;
