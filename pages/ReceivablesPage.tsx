import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatDate } from '../src/utils/dateUtils';
import { toast } from 'sonner';

interface ReceivableItem {
  id: string; // Composite ID: orderId-type
  orderId: string;
  orderNumber: string;
  clientName: string;
  description: string; // "Entrada" or "Restante"
  amount: number;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
}

const ReceivablesPage: React.FC = () => {
  const [receivables, setReceivables] = useState<ReceivableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue'>('all');

  useEffect(() => {
    fetchReceivables();
  }, []);

  const fetchReceivables = async () => {
    try {
      setLoading(true);
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id, 
          order_number, 
          entry_amount, 
          entry_date, 
          entry_confirmed, 
          remaining_amount, 
          remaining_date, 
          remaining_confirmed,
          partners (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items: ReceivableItem[] = [];

      orders?.forEach((order: any) => {
        // Entry Installment
        if (order.entry_amount > 0) {
          items.push({
            id: `${order.id}-entry`,
            orderId: order.id,
            orderNumber: order.order_number,
            clientName: order.partners?.name || 'Cliente Removido',
            description: 'ENTRADA',
            amount: order.entry_amount,
            dueDate: order.entry_date,
            isPaid: order.entry_confirmed,
            paidDate: order.entry_confirmed ? order.entry_date : undefined // Using entry_date as proxy if confirmed
          });
        }
        // Remaining Installment
        if (order.remaining_amount > 0) {
          items.push({
            id: `${order.id}-remaining`,
            orderId: order.id,
            orderNumber: order.order_number,
            clientName: order.partners?.name || 'Cliente Removido',
            description: 'RESTANTE',
            amount: order.remaining_amount,
            dueDate: order.remaining_date,
            isPaid: order.remaining_confirmed,
            paidDate: order.remaining_confirmed ? order.remaining_date : undefined
          });
        }
      });

      // Sort by Due Date
      items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      setReceivables(items);
    } catch (error: any) {
      console.error('Erro ao buscar contas a receber:', error);
      toast.error('Erro ao carregar contas a receber.');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (item: ReceivableItem) => {
    try {
      const type = item.description === 'ENTRADA' ? 'entry' : 'remaining';
      const updateData = type === 'entry' 
        ? { entry_confirmed: true } 
        : { remaining_confirmed: true };

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', item.orderId);

      if (error) throw error;

      toast.success(`Recebimento de ${item.description} confirmado!`);
      fetchReceivables(); // Reload
    } catch (error: any) {
      toast.error('Erro ao confirmar recebimento: ' + error.message);
    }
  };

  // Filter Logic
  const filteredItems = receivables.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !item.isPaid;
    if (filter === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      return !item.isPaid && item.dueDate < today;
    }
    return true;
  });

  const totalReceivable = filteredItems.reduce((acc, item) => acc + item.amount, 0);

  const isOverdue = (date: string, isPaid: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    return !isPaid && date < today;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
            <span className="material-icons-outlined text-green-500 text-3xl">account_balance_wallet</span>
            Contas a Receber
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de entradas e recebimentos de pedidos</p>
        </div>
        
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${filter === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${filter === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Pendentes
          </button>
          <button 
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${filter === 'overdue' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Em Atraso
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <p className="text-xs font-bold text-gray-400 uppercase mb-2">Total Listado</p>
           <p className="text-3xl font-black text-gray-800">
             {totalReceivable.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </p>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-100 shadow-sm">
           <p className="text-xs font-bold text-red-400 uppercase mb-2">Total em Atraso</p>
           <p className="text-3xl font-black text-red-600">
             {receivables.filter(r => isOverdue(r.dueDate, r.isPaid)).reduce((acc, r) => acc + r.amount, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
           <p className="text-xs font-bold text-green-400 uppercase mb-2">Recebido (Total)</p>
           <p className="text-3xl font-black text-green-600">
             {receivables.filter(r => r.isPaid).reduce((acc, r) => acc + r.amount, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
           </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vencimento</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pedido / Cliente</th>
                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Parcela</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400 text-sm">Carregando...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400 text-sm">Nenhum registro encontrado.</td></tr>
              ) : (
                filteredItems.map((item) => {
                  const overdue = isOverdue(item.dueDate, item.isPaid);
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${overdue ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-bold ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatDate(item.dueDate)}
                        </span>
                        {overdue && <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-600 uppercase">Atrasado</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">#{item.orderNumber}</span>
                          <span className="text-xs text-gray-500">{item.clientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.description === 'ENTRADA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {item.description}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {item.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {item.isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 uppercase">
                            <span className="material-icons-outlined text-xs">check_circle</span> Pago
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 uppercase">
                            <span className="material-icons-outlined text-xs">schedule</span> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {!item.isPaid && (
                          <button 
                            onClick={() => confirmPayment(item)}
                            className="text-blue-600 hover:text-blue-900 font-bold text-xs uppercase hover:underline"
                          >
                            Confirmar Recebimento
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReceivablesPage;
