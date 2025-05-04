
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Waiter, Restaurant } from '@/types';

interface StatsProps {
  waiters: Waiter[];
  restaurant: Restaurant;
}

export const Stats = ({ waiters, restaurant }: StatsProps) => {
  const totalWaiters = waiters.length;
  const totalClicks = waiters.reduce((sum, waiter) => sum + waiter.clicks, 0);
  
  // Find the top performing waiter
  let topWaiter = waiters[0];
  for (const waiter of waiters) {
    if (waiter.clicks > (topWaiter?.clicks || 0)) {
      topWaiter = waiter;
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Garçons</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWaiters}</div>
          <p className="text-xs text-muted-foreground">
            Garçons registrados
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Cliques em Avaliações</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalClicks}</div>
          <p className="text-xs text-muted-foreground">
            Total de cliques rastreados em links de avaliação
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Garçom com Melhor Desempenho</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topWaiter?.name || "N/A"}</div>
          <p className="text-xs text-muted-foreground">
            {topWaiter ? `${topWaiter.clicks} cliques em avaliações` : "Sem dados disponíveis"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
