
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Clock } from "lucide-react";
import { Restaurant, Waiter } from '@/types';
import { getDaysUntilEndOfMonth } from '@/services/waiterService';

interface LeaderboardVisualProps {
  waiters: Waiter[];
  restaurant: Restaurant;
}

export const LeaderboardVisual: React.FC<LeaderboardVisualProps> = ({ waiters, restaurant }) => {
  // Sort waiters by clicks in descending order
  const sortedWaiters = [...waiters].sort((a, b) => b.clicks - a.clicks);
  const daysUntilEndOfMonth = getDaysUntilEndOfMonth();
  const hours = 1; // Placeholder - can be dynamic if needed
  const minutes = 1; // Placeholder - can be dynamic if needed
  
  // Calculate total card taps this month and last month (simulated values)
  const thisMonthTaps = sortedWaiters.reduce((sum, waiter) => sum + waiter.clicks, 0);
  // Last month is simulated with a slightly higher number
  const lastMonthTaps = Math.floor(thisMonthTaps * 1.5) || 26; // Default to 26 if no data
  
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
  
  // Background colors for different ranks
  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-blue-600 text-white';
      case 2: return 'bg-red-600 text-white';
      default: return rank % 2 === 0 ? 'bg-white' : 'bg-gray-100';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Left side - Main leaderboard */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
            <CardTitle className="text-2xl font-bold text-center w-full">
              RANKING GERAL
            </CardTitle>
            <div className="bg-green-500 text-white absolute right-0 top-0 p-2 px-4">
              <div className="text-xs uppercase">TIME REMAINING</div>
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                <span>{daysUntilEndOfMonth}</span>
                <span>:</span>
                <span>{hours.toString().padStart(2, '0')}</span>
                <span>:</span>
                <span>{minutes.toString().padStart(2, '0')}</span>
              </div>
              <div className="text-xs flex items-center justify-between">
                <span>DAYS</span>
                <span className="ml-6">HOURS</span>
                <span className="ml-2">MINUTES</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* New Reviews This Month */}
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <p className="text-sm font-medium">New Reviews This Month</p>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <div className="text-sm text-gray-600">{rating}</div>
                        <div className="h-2 bg-yellow-200 flex-1" style={{ 
                          width: `${rating === 3 ? '70%' : rating > 3 ? '40%' : '20%'}` 
                        }}></div>
                      </div>
                    ))}
                  </div>
                  <div className="text-4xl font-bold text-green-500 mt-4">3</div>
                </CardContent>
              </Card>

              {/* Total Card Taps */}
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <p className="text-sm font-medium">Total Card Taps</p>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-around">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-500">{thisMonthTaps || 6}</div>
                      <p className="text-xs text-gray-500">This Month</p>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold">{lastMonthTaps}</div>
                      <p className="text-xs text-gray-500">Last Month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Rating */}
              <Card className="shadow-sm">
                <CardHeader className="p-4 pb-0">
                  <p className="text-sm font-medium">Overall Rating</p>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <div className="text-sm text-gray-600">{rating}</div>
                        <div className="h-2 bg-yellow-200 flex-1" style={{ 
                          width: rating === 5 ? '80%' : rating === 4 ? '15%' : '5%'
                        }}></div>
                      </div>
                    ))}
                  </div>
                  <div className="text-4xl font-bold text-green-500 mt-3">4.9</div>
                  <p className="text-xs text-gray-500">{restaurant.totalReviews || 1113} Total Reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Waiter Rankings Table */}
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
          </CardContent>
        </Card>
      </div>

      {/* Right side - Past winners */}
      <div className="lg:col-span-1">
        <Card className="h-full bg-blue-600 text-white">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl text-center">PAST WINNERS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 flex flex-col items-center justify-around h-[calc(100%-80px)]">
            {pastWinners.map((winner, index) => (
              <div key={index} className="flex items-center gap-4 w-full">
                <div className="text-yellow-300">
                  <Trophy size={40} />
                </div>
                <div>
                  <div className="font-bold">{winner.name}</div>
                  <div className="text-sm">{winner.month} {winner.year}</div>
                </div>
              </div>
            ))}
            <div className="text-xs text-center mt-auto pt-4">
              Powered by: Target
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
