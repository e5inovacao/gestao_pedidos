import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatMonthYear } from '../src/utils/dateUtils';

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const CommissionPage: React.FC = () => {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCommissions();
  }, [month, year]);

  const fetchCommissions = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Calculate start and end date of the selected month
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0).toISOString();

      const { data, error } = await supabase
        .from('commissions')
        .select(`
          *,
          orders (
            order_number,
            partners (
              name
            )
          )
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommissions(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar comissões:', error);
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        setErrorMsg('ERRO DE CONFIGURAÇÃO: A tabela de comissões não foi encontrada. Por favor, execute o script "supabase/migrations/002_commissions.sql" no SQL Editor do Supabase.');
      } else {
        setErrorMsg(`Erro ao carregar comissões: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalCommissions = commissions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  const sellers = ['VENDAS 01', 'VENDAS 02', 'VENDAS 03', 'VENDAS 04'];
  const sellerStats = sellers.map(seller => ({
    name: seller,
    total: commissions.filter(c => c.salesperson === seller).reduce((acc, curr) => acc + (curr.amount || 0), 0)
  }));
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  
  const filteredCommissions = selectedSeller 
    ? commissions.filter(c => c.salesperson === selectedSeller)
    : commissions;

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
          <span className="material-icons-outlined text-blue-500 text-3xl">payments</span>
          Gestão de Comissões
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4 items-end">
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
        <div className="ml-auto text-right">
          <p className="text-xs font-bold text-gray-400 uppercase">Total de Comissões</p>
          <p className="text-2xl font-black text-green-500">{formatCurrency(totalCommissions)}</p>
        </div>
      </div>

      {/* Seller Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {sellerStats.map(stat => (
          <div 
            key={stat.name}
            onClick={() => setSelectedSeller(selectedSeller === stat.name ? null : stat.name)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedSeller === stat.name ? 'bg-blue-50 border-blue-500 shadow-md' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}
          >
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{stat.name}</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-black text-gray-800">{formatCurrency(stat.total)}</span>
              {selectedSeller === stat.name && <span className="material-icons-outlined text-blue-500 text-sm">check_circle</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Comissão</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Carregando...</td>
                </tr>
              ) : filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Nenhuma comissão encontrada neste período.</td>
                </tr>
              ) : (
                filteredCommissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{comm.salesperson}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-bold">
                      #{comm.orders?.order_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {comm.orders?.partners?.name || 'Cliente Removido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">
                      <span className={`px-2 py-1 rounded-full ${comm.type === 'ENTRADA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {comm.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right">
                      {formatCurrency(comm.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${comm.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {comm.status === 'PENDING' ? 'PENDENTE' : 'PAGO'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommissionPage;
