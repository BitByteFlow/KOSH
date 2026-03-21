import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_SALES_HISTORY } from '../graphql/operations';
import { format } from 'date-fns';
import { ShoppingBag, Calendar, CreditCard, Banknote, History, ExternalLink, ChevronRight, Search, Filter } from 'lucide-react';
import { Button } from "@kosh/ui/components/button";
import { Card, CardContent, CardHeader } from "@kosh/ui/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@kosh/ui/components/table";
import { Badge } from "@kosh/ui/components/badge";
import { Input } from "@kosh/ui/components/input";

const TransactionsPage: React.FC = () => {
  const { data, loading, error } = useQuery(GET_SALES_HISTORY, {
    variables: { page: 1, limit: 20 }
  });

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Loading History</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-500 h-full flex items-center justify-center">
      <div>
        <h3 className="text-xl font-bold">Error loading history</h3>
        <p>{error.message}</p>
      </div>
    </div>
  );

  const transactions = (data as any)?.getSales?.data || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">TRANSACTION LOG</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and audit your recent store sales.</p>
        </div>
        
        <div className="flex gap-2">
           <Button variant="outline" className="h-10 bg-white border-slate-200 shadow-sm gap-2">
             <Calendar size={16} />
             <span>Last 7 Days</span>
           </Button>
           <Button variant="outline" size="icon" className="h-10 w-10 bg-white border-slate-200">
             <Filter size={16} />
           </Button>
        </div>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input placeholder="Search by ID or payment type..." className="pl-10 bg-white border-slate-200 h-10" />
            </div>
            <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> Completed</span>
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-100 border border-slate-300" /> Draft</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[120px] font-bold text-[10px] uppercase tracking-wider text-slate-400 py-4 pl-6">ID</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Date & Time</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Items</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Method</TableHead>
                <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider text-slate-400 pr-6">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction: any) => (
                <TableRow key={transaction.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <TableCell className="py-4 pl-6">
                    <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-primary transition-colors uppercase">
                      #{transaction.id.slice(0, 8)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm">{format(new Date(transaction.createdAt), 'MMM dd, yyyy')}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{format(new Date(transaction.createdAt), 'hh:mm a')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white border-slate-100 text-slate-500 font-bold px-1.5">
                      {transaction.items?.length || 0} items
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       {transaction.paymentType === 'CASH' && <Banknote size={14} className="text-green-500" />}
                       {transaction.paymentType === 'ONLINE' && <CreditCard size={14} className="text-blue-500" />}
                       {transaction.paymentType === 'CREDIT' && <History size={14} className="text-orange-500" />}
                       <span className="text-xs font-bold text-slate-600 tracking-wide">{transaction.paymentType}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-base font-black text-slate-900">${transaction.total.toFixed(2)}</span>
                      <div className="p-1 rounded-md opacity-0 group-hover:opacity-100 bg-white border border-slate-200 transition-all shadow-sm">
                        <ChevronRight size={14} className="text-slate-400" />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                      <ShoppingBag size={48} className="text-slate-200" />
                      <p className="font-bold">No transactions found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-center pt-4">
         <Button variant="outline" className="bg-white text-slate-400 font-bold text-xs uppercase tracking-widest border-slate-200 h-11 px-8 rounded-xl shadow-sm hover:text-primary transition-all">
           View Detailed Analytics <ExternalLink size={14} className="ml-2" />
         </Button>
      </div>
    </div>
  );
};

export default TransactionsPage;
