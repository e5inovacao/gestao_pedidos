import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatMonthYear } from '../src/utils/dateUtils';

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const [stats, setStats] = useState({
    totalSales: 0,
    totalNet: 0,
    totalCommissions: 0,
    totalFixedExpenses: 0,
    orderCount: 0,
    topProducts: [] as {name: string, qty: number, total: number}[],
    salesByStatus: [] as {status: string, count: number, total: number}[]
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0).toISOString();

      // 1. Fetch Orders and Items
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          order_items (
            product_name,
            quantity,
            unit_price,
            customization_cost,
            supplier_transport_cost,
            client_transport_cost,
            extra_expense,
            layout_cost,
            real_unit_price,
            real_customization_cost,
            real_supplier_transport_cost,
            real_client_transport_cost,
            real_extra_expense,
            real_layout_cost
          )
        `)
        .gte('order_date', startDate)
        .lte('order_date', endDate);

      if (orderError) throw orderError;

      // 2. Fetch Commissions
      const { data: commissions, error: commError } = await supabase
        .from('commissions')
        .select('amount')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (commError) throw commError;

      // 3. Fetch Fixed Expenses
      const { data: expenses, error: expError } = await supabase
        .from('company_expenses')
        .select('amount')
        .gte('due_date', startDate)
        .lte('due_date', endDate);

      if (expError && !expError.message.includes('relation "company_expenses" does not exist')) {
         console.error('Error fetching expenses', expError);
      }

      // Calculations
      let totalSales = 0;
      let totalCost = 0;
      const productMap: Record<string, {qty: number, total: number}> = {};
      const statusMap: Record<string, {count: number, total: number}> = {};

      orders?.forEach(order => {
        totalSales += order.total_amount || 0;

        // Status Stats
        if (!statusMap[order.status]) statusMap[order.status] = { count: 0, total: 0 };
        statusMap[order.status].count++;
        statusMap[order.status].total += order.total_amount || 0;

        order.order_items?.forEach((item: any) => {
          // Use Real Cost if available, otherwise Estimated
          // Actually, for Net Profit we should probably use Real Cost if paid? 
          // Or just Real Cost field if it exists.
          // Let's sum Real Costs fields.
          const realItemCost = 
            (item.quantity * (item.real_unit_price || 0)) + 
            (item.real_customization_cost || 0) + 
            (item.real_supplier_transport_cost || 0) + 
            (item.real_client_transport_cost || 0) + 
            (item.real_extra_expense || 0) + 
            (item.real_layout_cost || 0);
          
          // If real cost is 0, maybe use estimated? 
          // Usually Net Profit analysis checks Realized costs. 
          // If Real is 0, it might mean we haven't paid yet or it's pure profit? 
          // Let's use Real Cost if > 0, else Estimated. This is a heuristic.
          
          const estItemCost = 
            (item.quantity * item.unit_price) + 
            (item.customization_cost || 0) + 
            (item.supplier_transport_cost || 0) + 
            (item.client_transport_cost || 0) + 
            (item.extra_expense || 0) + 
            (item.layout_cost || 0);

          totalCost += (realItemCost > 0 ? realItemCost : estItemCost);

          // Product Stats
          const pName = item.product_name || 'Indefinido';
          if (!productMap[pName]) productMap[pName] = { qty: 0, total: 0 };
          productMap[pName].qty += item.quantity;
          productMap[pName].total += (item.quantity * item.unit_price);
        });
      });

      const totalCommissions = commissions?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
      const totalFixedExpenses = expenses?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
      
      const totalNet = totalSales - totalCost - totalCommissions - totalFixedExpenses;

      // Sort Top Products
      const topProducts = Object.entries(productMap)
        .map(([name, val]) => ({ name, ...val }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Sort Status
      const salesByStatus = Object.entries(statusMap)
        .map(([status, val]) => ({ status, ...val }))
        .sort((a, b) => b.total - a.total);

      setStats({
        totalSales,
        totalNet,
        totalCommissions,
        totalFixedExpenses,
        orderCount: orders?.length || 0,
        topProducts,
        salesByStatus
      });

    } catch (error: any) {
      console.error('Erro ao carregar relatório:', error);
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        setErrorMsg('ERRO DE CONFIGURAÇÃO: A tabela de comissões não foi encontrada. Por favor, execute o script "supabase/migrations/002_commissions.sql" no SQL Editor do Supabase.');
      } else {
        setErrorMsg(`Erro ao carregar dados: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {errorMsg && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md" role="alert">
          <p className="font-bold">Atenção</p>
          <p>{errorMsg}</p>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 uppercase flex items-center gap-3">
          <span className="material-icons-outlined text-blue-500 text-3xl">analytics</span>
          Relatório
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mês</label>
          <select 
            value={month} 
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="form-select rounded-lg border-gray-300 text-sm font-bold"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {formatMonthYear(i + 1, year).split(' DE ')[0]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Ano</label>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="form-select rounded-lg border-gray-300 text-sm font-bold"
          >
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Vendas Brutas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-icons-outlined text-8xl text-blue-500">shopping_cart</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Vendas (Bruto)</p>
          <h3 className="text-3xl font-black text-blue-600 mb-1">{formatCurrency(stats.totalSales)}</h3>
          <p className="text-xs text-gray-400 font-medium">{stats.orderCount} pedidos no período</p>
        </div>

        {/* Card Comissões */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-icons-outlined text-8xl text-purple-500">payments</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Comissões</p>
          <h3 className="text-3xl font-black text-purple-600 mb-1">{formatCurrency(stats.totalCommissions)}</h3>
          <p className="text-xs text-gray-400 font-medium">Devido aos vendedores</p>
        </div>

        {/* Card Despesas Fixas */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-icons-outlined text-8xl text-red-500">money_off</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Despesas Fixas</p>
          <h3 className="text-3xl font-black text-red-600 mb-1">{formatCurrency(stats.totalFixedExpenses)}</h3>
          <p className="text-xs text-gray-400 font-medium">Aluguel, Salários, etc.</p>
        </div>

        {/* Card Líquido */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-icons-outlined text-8xl text-green-500">account_balance</span>
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Lucro Líquido (Estimado)</p>
          <h3 className={`text-3xl font-black mb-1 ${stats.totalNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(stats.totalNet)}</h3>
          <p className="text-xs text-gray-400 font-medium">Vendas - Custos - Comissões - Fixos</p>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
             <span className="material-icons-outlined text-orange-500">emoji_events</span>
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Produtos Mais Vendidos</h3>
          </div>
          <div className="space-y-4">
            {stats.topProducts.length === 0 ? (
               <p className="text-sm text-gray-400 italic text-center py-4">Nenhum dado disponível</p>
            ) : (
               stats.topProducts.map((p, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                       <div>
                         <p className="text-xs font-bold text-gray-700 uppercase">{p.name}</p>
                         <p className="text-[10px] text-gray-400">{p.qty} unidades</p>
                       </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900">{formatCurrency(p.total)}</span>
                 </div>
               ))
            )}
          </div>
        </div>

        {/* Sales by Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
             <span className="material-icons-outlined text-blue-500">pie_chart</span>
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Vendas por Status</h3>
          </div>
          <div className="space-y-4">
             {stats.salesByStatus.length === 0 ? (
               <p className="text-sm text-gray-400 italic text-center py-4">Nenhum dado disponível</p>
             ) : (
               stats.salesByStatus.map((s, i) => (
                 <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                       <span className="font-bold text-gray-600 uppercase">{s.status}</span>
                       <span className="text-gray-900 font-bold">{formatCurrency(s.total)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                       <div 
                         className="bg-blue-500 h-2 rounded-full" 
                         style={{ width: `${(s.total / stats.totalSales) * 100}%` }}
                       ></div>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
