import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDate } from '../src/utils/dateUtils';

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const [vendedorFilter, setVendedorFilter] = useState('Todos os Vendedores');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch orders with client name (join)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          order_number, 
          status, 
          order_date, 
          total_amount, 
          salesperson,
          partners (name, doc)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted = data.map((o: any) => ({
          id_original: o.id,
          id: o.order_number || o.id.substring(0,8),
          status: o.status,
          client: o.partners?.name || 'Cliente Removido',
          vendedor: o.salesperson,
          cnpj: o.partners?.doc || '-',
          date: formatDate(o.order_date),
          total: o.total_amount ? o.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00',
          statusColor: getStatusColor(o.status),
          dotColor: getStatusDotColor(o.status)
        }));
        setOrders(formatted);
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const map: any = {
      'EM ABERTO': 'bg-gray-100 text-gray-600',
      'EM PRODUÇÃO': 'bg-blue-100 text-blue-600',
      'FINALIZADO': 'bg-green-100 text-green-600'
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  const getStatusDotColor = (status: string) => {
    const map: any = {
      'EM ABERTO': 'bg-gray-400',
      'EM PRODUÇÃO': 'bg-blue-600',
      'FINALIZADO': 'bg-green-600'
    };
    return map[status] || 'bg-gray-400';
  };

  const filteredOrders = orders.filter(o => {
    const matchVendedor = vendedorFilter === 'Todos os Vendedores' || o.vendedor === vendedorFilter;
    const matchStatus = statusFilter === 'Todos' || o.status === statusFilter;
    return matchVendedor && matchStatus;
  });

  const statusOptions = [
    'Todos',
    'EM ABERTO', 'EM PRODUÇÃO', 'AGUARDANDO APROVAÇÃO', 
    'AGUARDANDO NF', 'AGUARDANDO PAGAMENTO', 
    'AGUARDANDO PERSONALIZAÇÃO', 'FINALIZADO'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center gap-2">
            <span className="material-icons-outlined text-blue-500 text-3xl">list_alt</span>
            Gestão de Pedidos
          </h2>
          <p className="mt-1 text-sm text-gray-500">Gerencie e filtre todos os pedidos de venda em um único lugar.</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/pedido/novo"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            <span className="material-icons-outlined mr-2">add_circle</span>
            Novo Pedido
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-8 p-5">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-grow w-full md:w-auto">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Buscar Pedido</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons-outlined text-gray-400">search</span>
              </span>
              <input
                type="text"
                placeholder="ID do Pedido, Cliente ou CNPJ"
                className="form-input block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Vendedor</label>
            <select 
              className="form-select block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
              value={vendedorFilter}
              onChange={(e) => setVendedorFilter(e.target.value)}
            >
              <option>Todos os Vendedores</option>
              <option>VENDAS 01</option>
              <option>VENDAS 02</option>
              <option>VENDAS 03</option>
              <option>VENDAS 04</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status</label>
            <select 
              className="form-select block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <button className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors h-10">
            <span className="material-icons-outlined mr-2 text-blue-500">filter_list</span>
            Filtros
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Carregando pedidos...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'STATUS', 'CLIENTE', 'VENDEDOR', 'DATA', 'VALOR TOTAL', 'AÇÕES'].map((head) => (
                  <th key={head} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      {head}
                      {head !== 'STATUS' && head !== 'AÇÕES' && <span className="material-icons-outlined text-sm opacity-50">unfold_more</span>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500 text-sm">
                    Nenhum pedido encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, i) => (
                  <tr 
                    key={i} 
                    onClick={() => navigate(`/pedido/${order.id_original}?mode=view`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-500">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.statusColor}`}>
                        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${order.dotColor}`}></span>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{order.client}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{order.vendedor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{order.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button className="text-gray-400 hover:text-blue-500" onClick={(e) => { e.stopPropagation(); /* Optional: keep menu working independently */ }}>
                        <span className="material-icons-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">1</span> a <span className="font-medium">{filteredOrders.length}</span> de <span className="font-medium">{filteredOrders.length}</span> resultados
          </p>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span className="material-icons-outlined text-sm">chevron_left</span>
            </button>
            <button className="z-10 bg-blue-500 border-blue-500 text-white relative inline-flex items-center px-4 py-2 border text-sm font-medium">1</button>
            <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span className="material-icons-outlined text-sm">chevron_right</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default OrderList;