
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Restaurant } from '@/types';
import { supabase } from '@/integrations/supabase/client';

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

const months = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

const getYears = () => {
  const years = [];
  const startYear = 2023;
  for (let year = startYear; year <= currentYear; year++) {
    years.push(year);
  }
  return years;
};

const Exports = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [exportType, setExportType] = useState<string>('waiter_clicks');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, google_review_url')
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Map database fields to our frontend types
      const mappedRestaurants: Restaurant[] = data.map(item => ({
        id: item.id,
        name: item.name,
        googleReviewUrl: item.google_review_url || ''
      }));
      
      setRestaurants(mappedRestaurants);
      
      if (mappedRestaurants.length > 0) {
        setSelectedRestaurant(mappedRestaurants[0].id);
      }
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

  const handleExport = async () => {
    if (!selectedRestaurant) {
      toast({
        title: 'Erro',
        description: 'Selecione um restaurante',
        variant: 'destructive',
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      // In a real implementation, we would generate and download the export
      // For now, we'll just simulate the export process
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
      
      const selectedRestaurantName = restaurants.find(r => r.id === selectedRestaurant)?.name || 'Unknown';
      
      toast({
        title: 'Exportação concluída',
        description: `Os dados de "${selectedRestaurantName}" foram exportados com sucesso.`,
      });
      
      // In a real implementation, this is where we would trigger the file download
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o arquivo de exportação',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AdminLayout title="Exportação de Dados">
      <div className="mb-6">
        <h2 className="text-lg font-medium">Exportação de Relatórios</h2>
        <p className="text-sm text-gray-500">
          Gere relatórios CSV e PDFs para download ou envio automático
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Exportar Dados</CardTitle>
            <CardDescription>Configure as opções de exportação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Restaurante</label>
              <Select 
                value={selectedRestaurant} 
                onValueChange={setSelectedRestaurant}
                disabled={isLoading || restaurants.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um restaurante" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map(restaurant => (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waiter_clicks">Clicks por Garçom</SelectItem>
                  <SelectItem value="monthly_ranking">Ranking Mensal</SelectItem>
                  <SelectItem value="reviews_evolution">Evolução de Avaliações</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mês</label>
                <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month.value} value={String(month.value)}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Ano</label>
                <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {getYears().map(year => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Formato</label>
              <div className="flex space-x-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 justify-start"
                  type="button"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 justify-start"
                  type="button"
                >
                  <FileText className="mr-2 h-4 w-4" /> PDF
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleExport}
              disabled={isExporting || !selectedRestaurant}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exportando...' : 'Exportar Dados'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Exportações Recentes</CardTitle>
            <CardDescription>Histórico de relatórios exportados</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurante</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">
                    {restaurants.length > 0 ? restaurants[0].name : 'Restaurante Demo'}
                  </TableCell>
                  <TableCell>Clicks por Garçom</TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-3 w-3" />
                    {`${new Date().toLocaleDateString('pt-BR')}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">
                    {restaurants.length > 0 ? restaurants[0].name : 'Restaurante Demo'}
                  </TableCell>
                  <TableCell>Ranking Mensal</TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-3 w-3" />
                    {`${new Date(Date.now() - 86400000).toLocaleDateString('pt-BR')}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Os arquivos exportados ficam disponíveis por 30 dias
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Envio Automático</CardTitle>
          <CardDescription>Configure envios automáticos de relatórios por email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Configure envios automáticos de relatórios diretamente para o email do responsável pelo restaurante.
              Os relatórios serão gerados e enviados automaticamente na data escolhida.
            </p>
            
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" disabled>
                Configurar Envio Automático
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Exports;
