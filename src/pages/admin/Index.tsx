
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useToast } from "@/components/ui/use-toast";
import { Building, Users, Star, BarChart } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalWaiters: number;
  totalReviews: number;
}

const Admin = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalWaiters: 0,
    totalReviews: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch total restaurants
        const { count: totalRestaurants, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true });

        // Fetch active restaurants (with active plan)
        const { count: activeRestaurants, error: activeError } = await supabase
          .from('restaurants')
          .select('*', { count: 'exact', head: true })
          .eq('plan_status', 'active');

        // Fetch total waiters
        const { count: totalWaiters, error: waitersError } = await supabase
          .from('waiters')
          .select('*', { count: 'exact', head: true });

        // Fetch total reviews
        const { count: totalReviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true });

        if (restaurantError || activeError || waitersError || reviewsError) {
          throw new Error('Error fetching dashboard stats');
        }

        setStats({
          totalRestaurants: totalRestaurants || 0,
          activeRestaurants: activeRestaurants || 0,
          totalWaiters: totalWaiters || 0,
          totalReviews: totalReviews || 0
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        toast({
          title: "Erro ao carregar estatísticas",
          description: "Não foi possível carregar os dados do dashboard",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <AdminLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800">
          Visão Geral do Sistema
        </h2>
        <p className="text-sm text-gray-500">
          Estatísticas gerais da plataforma WaiterLink
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Restaurantes</CardTitle>
            <Building className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalRestaurants}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeRestaurants} ativos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Garçons</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalWaiters}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cadastrados na plataforma
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            <Star className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalReviews}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Gerenciadas pelo sistema
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <BarChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : 
                (stats.totalWaiters > 0 ? 
                  `${Math.round((stats.totalReviews / stats.totalWaiters) * 100)}%` : 
                  "0%")
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Média de conversões
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Navegue pelas principais seções</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/restaurants">
                <Building className="mr-2 h-4 w-4" />
                Gerenciar Restaurantes
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/exports">
                <Download className="mr-2 h-4 w-4" />
                Exportar Relatórios
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/backups">
                <Folder className="mr-2 h-4 w-4" />
                Gerenciar Backups
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                Configurações do Sistema
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Sistema</CardTitle>
            <CardDescription>Desempenho geral da plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Restaurantes ativos:</span>
                <span className="font-medium">{stats.activeRestaurants}/{stats.totalRestaurants}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ 
                    width: `${stats.totalRestaurants > 0 ? 
                      (stats.activeRestaurants / stats.totalRestaurants) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex flex-col space-y-1.5">
                <span className="text-sm font-medium">Funcionamento do Sistema</span>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Todos os serviços operando normalmente</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Última atualização: {new Date().toLocaleString()}
            </p>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Admin;
