
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const RegistrationList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CLIENTE' | 'FORNECEDOR'>('CLIENTE');
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('partners').select('*').order('name');
      if (error) throw error;
      if (data) {
        setPartners(data.map(p => ({
          ...p,
          initials: p.name.substring(0, 2).toUpperCase(),
          color: p.type === 'CLIENTE' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600',
          type: p.type // ou mapear para algo mais descritivo
        })));
      }
    } catch (err) {
      console.error('Erro ao buscar parceiros:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentData = partners.filter(p => p.type === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center gap-3">
            <span className="material-icons-outlined text-blue-500 text-3xl">contacts</span>
            Gerenciamento de Cadastros
          </h2>
          <p className="mt-1 text-sm text-gray-500">Visualize e gerencie a lista de clientes e fornecedores parceiros.</p>
        </div>
        <Link
          to="/cadastros/novo"
          className="ml-3 inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors"
        >
          <span className="material-icons-outlined mr-2">add</span>
          Adicionar Novo
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <nav className="flex space-x-6">
            <button 
              onClick={() => setActiveTab('CLIENTE')}
              className={`${activeTab === 'CLIENTE' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500'} border-b-2 font-bold text-sm flex items-center gap-2 pb-2 transition-all`}
            >
              Clientes <span className={`py-0.5 px-2.5 rounded-full text-xs ${activeTab === 'CLIENTE' ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-500'}`}>128</span>
            </button>
            <button 
              onClick={() => setActiveTab('FORNECEDOR')}
              className={`${activeTab === 'FORNECEDOR' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500'} border-b-2 font-bold text-sm flex items-center gap-2 pb-2 transition-all`}
            >
              Fornecedores <span className={`py-0.5 px-2.5 rounded-full text-xs ${activeTab === 'FORNECEDOR' ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-500'}`}>42</span>
            </button>
          </nav>
          <div className="relative max-w-xs w-full">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-400 text-sm">filter_list</span>
             <input type="text" placeholder="Filtrar por nome, CNPJ..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Nome / Razão Social', 'CNPJ', 'Telefone', 'E-mail', ''].map(h => (
                <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
               <tr><td colSpan={5} className="p-10 text-center text-gray-500">Carregando parceiros...</td></tr>
            ) : currentData.length === 0 ? (
               <tr><td colSpan={5} className="p-10 text-center text-gray-500">Nenhum registro encontrado.</td></tr>
            ) : (
            currentData.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${c.color}`}>{c.initials}</div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.type}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{c.doc || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{c.phone || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.email || '-'}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button className="text-blue-500 hover:text-blue-700 mx-2"><span className="material-icons-outlined">edit</span></button>
                  <button className="text-gray-400 hover:text-red-600 mx-2"><span className="material-icons-outlined">delete</span></button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
        
        <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{currentData.length > 0 ? 1 : 0}</span> a <span className="font-medium">{currentData.length}</span> de <span className="font-medium">{activeTab === 'CLIENTE' ? partners.filter(p => p.type === 'CLIENTE').length : partners.filter(p => p.type === 'FORNECEDOR').length}</span> resultados
          </p>
          <nav className="inline-flex rounded-md shadow-sm -space-x-px">
            <button className="px-2 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"><span className="material-icons-outlined text-sm">chevron_left</span></button>
            <button className="bg-blue-50 border-blue-500 text-blue-500 px-4 py-2 border text-sm font-medium">1</button>
            <button className="px-2 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50"><span className="material-icons-outlined text-sm">chevron_right</span></button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default RegistrationList;
