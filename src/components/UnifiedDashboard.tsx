
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Clock } from "lucide-react";
import { Restaurant, Waiter } from '@/types';

interface UnifiedDashboardProps {
  waiters: Waiter[];
  restaurant: Restaurant;
}

export const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ waiters, restaurant }) => {
  // Sort waiters by clicks in descending order
  const sortedWaiters = [...waiters].sort((a, b) => b.clicks - a.clicks);
  
  // Time remaining logic with actual countdown
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calculate time remaining until end of month
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diffMs = lastDayOfMonth.getTime() - now.getTime();
      
      // Convert to days, hours, minutes, seconds
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeRemaining({ days, hours, minutes, seconds });
    };
    
    // Calculate immediately
    calculateTimeRemaining();
    
    // Update every second
    const interval = setInterval(calculateTimeRemaining, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Background colors for different ranks
  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-blue-600 text-white';
      case 2: return 'bg-red-600 text-white';
      default: return rank % 2 === 0 ? 'bg-white' : 'bg-gray-100';
    }
  };
  
  // Past winners (simulated)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Create past winners for 4 months
  const pastWinners = Array.from({ length: 4 }, (_, i) => {
    const monthIndex = (currentMonth - i - 1 + 12) % 12;
    const year = currentMonth - i - 1 < 0 ? currentYear - 1 : currentYear;
    
    return {
      name: sortedWaiters[0]?.name || "DOUGLAS", // Default to "DOUGLAS" if no waiters
      month: monthNames[monthIndex],
      year: year
    };
  });

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardTitle className="text-2xl font-bold">
          RANKING GERAL
        </CardTitle>
        <div className="bg-green-500 text-white p-2 px-4 rounded-md">
          <div className="text-xs uppercase font-semibold">TEMPO RESTANTE</div>
          <div className="text-2xl font-bold flex items-center justify-center gap-1">
            <span>{timeRemaining.days}</span>
            <span>:</span>
            <span>{timeRemaining.hours.toString().padStart(2, '0')}</span>
            <span>:</span>
            <span>{timeRemaining.minutes.toString().padStart(2, '0')}</span>
            <span>:</span>
            <span>{timeRemaining.seconds.toString().padStart(2, '0')}</span>
          </div>
          <div className="text-xs flex items-center justify-between">
            <span>DIAS</span>
            <span className="ml-4">H</span>
            <span className="ml-4">MIN</span>
            <span className="ml-4">SEG</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Left side - Main leaderboard */}
          <div className="lg:col-span-3 p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Review Requests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedWaiters.length > 0 ? (
                  sortedWaiters.map((waiter, index) => (
                    <TableRow 
                      key={waiter.id} 
                      className={`${getRankBackground(index + 1)}`}
                    >
                      <TableCell className="font-bold">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{waiter.name}</TableCell>
                      <TableCell className="text-right">{waiter.clicks || (index === 0 ? 2 : 1)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Sample data if no waiters available
                  [
                    { name: "DIEGO", clicks: 2 },
                    { name: "Renan - Cartão Teste Pessoal", clicks: 1 },
                    { name: "diego sousa", clicks: 1 },
                    { name: "cassio", clicks: 1 },
                    { name: "DOUGLAS", clicks: 1 }
                  ].map((item, index) => (
                    <TableRow 
                      key={index} 
                      className={`${getRankBackground(index + 1)}`}
                    >
                      <TableCell className="font-bold">#{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.clicks}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Right side - Past winners */}
          <div className="lg:col-span-1 bg-blue-600 text-white p-4">
            <div className="text-xl font-bold text-center mb-4">PAST WINNERS</div>
            <div className="space-y-6">
              {pastWinners.map((winner, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="text-yellow-300">
                    <Trophy size={32} />
                  </div>
                  <div>
                    <div className="font-bold">{winner.name}</div>
                    <div className="text-sm">{winner.month} {winner.year}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-xs text-center mt-8 pt-4 border-t border-blue-500">
              Powered by: Target
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
