
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Medal, Clock } from "lucide-react";
import { LeaderboardEntry, MonthlyChampion } from '@/types';
import { getCurrentLeaderboard, getMonthlyChampions, getDaysUntilEndOfMonth } from '@/services/waiterService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [champions, setChampions] = useState<MonthlyChampion[]>([]);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  
  useEffect(() => {
    // Load leaderboard data
    const fetchData = async () => {
      const leaderboardData = await getCurrentLeaderboard();
      setLeaderboard(leaderboardData);
      
      const championsData = await getMonthlyChampions();
      setChampions(championsData);
      
      setDaysLeft(getDaysUntilEndOfMonth());
    };
    
    fetchData();
    
    // Update days counter every day
    const interval = setInterval(() => {
      setDaysLeft(getDaysUntilEndOfMonth());
    }, 86400000); // 24 hours
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Monthly Leaderboard</CardTitle>
              <CardDescription>Top performing waiters this month</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No waiters registered yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Waiter</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.waiterId}>
                    <TableCell className="font-medium">
                      {entry.position === 1 ? (
                        <div className="flex items-center">
                          <Medal className="h-5 w-5 mr-2 text-yellow-500" />
                          <span>1st</span>
                        </div>
                      ) : (
                        <span>{entry.position}{entry.position === 2 ? 'nd' : entry.position === 3 ? 'rd' : 'th'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {entry.waiterName}
                        {entry.position === 1 && (
                          <Badge variant="secondary" className="ml-2">Top Performer</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{entry.clicks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {champions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Hall of Fame</CardTitle>
            <CardDescription>Monthly champions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Waiter</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {champions.map((champion, index) => (
                  <TableRow key={index}>
                    <TableCell>{champion.month} {champion.year}</TableCell>
                    <TableCell>{champion.waiterName || champion.waiter_name}</TableCell>
                    <TableCell className="text-right">{champion.clicks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
