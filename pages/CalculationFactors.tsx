
import React from 'react';
import { Link } from 'react-router-dom';

const CalculationFactors: React.FC = () => {
  const factors = [
    { name: 'Margem Padrão', desc: 'Aplicado à maioria dos brindes promocionais de baixo custo unitário para garantir rentabilidade.', value: '1.35x', status: 'Ativo', icon: 'percent', color: 'bg-indigo-50 text-indigo-600' },
    { name: 'Linha Premium', desc: 'Fator específico para itens de luxo e importados, considerando custos extras de logística.', value: '1.60x', status: 'Ativo', icon: 'diamond', color: 'bg-emerald-50 text-emerald-600' },
    { name: 'Ajuste Logístico', desc: 'Adicional para entregas em regiões remotas (Norte/Nordeste) ou frete aéreo urgente.', value: '1.15x', status: 'Ativo', icon: 'local_shipping', color: 'bg-amber-50 text-amber-600' },
    { name: 'Urgência 24h', desc: 'Taxa emergencial para pedidos que precisam ser despachados em menos de 24 horas úteis.', value: '2.00x', status: 'Inativo', icon: 'bolt', color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="md:flex md:items-center md:justify-between mb-8">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center gap-3">
            <span class="material-symbols-outlined text-blue-500 text-3xl">calculate</span>
            Fatores de Cálculo
          </h2>
          <p class="mt-1 text-sm text-gray-500">Gerencie os multiplicadores e índices aplicados na precificação dos produtos.</p>
        </div>
        <Link to="/configuracoes/fatores/novo" class="ml-3 inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors">
          <span class="material-symbols-outlined mr-2">add</span> Adicionar Fator
        </Link>
      </div>

      <div class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div class="border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="bg-blue-100 text-blue-500 py-1 px-3 rounded-md text-xs font-bold uppercase">Total</span>
            <span class="text-gray-900 font-semibold">{factors.length} Fatores</span>
          </div>
          <div class="relative max-w-xs w-full">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[20px]">filter_list</span>
            <input type="text" placeholder="Filtrar fatores..." class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>

        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Nome do Fator</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-1/2">Descrição</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Multiplicador</th>
              <th class="relative px-6 py-4"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {factors.map((f, i) => (
              <tr key={i} class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class={`h-10 w-10 rounded-lg flex items-center justify-center ${f.color}`}><span class="material-symbols-outlined">{f.icon}</span></div>
                    <div class="ml-4">
                      <div class="text-sm font-bold text-gray-900">{f.name}</div>
                      <div class={`text-xs font-medium ${f.status === 'Ativo' ? 'text-green-600' : 'text-gray-400'}`}>{f.status}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4"><p class="text-sm text-gray-500 line-clamp-2">{f.desc}</p></td>
                <td class="px-6 py-4"><span class="inline-flex px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-700">{f.value}</span></td>
                <td class="px-6 py-4 text-right">
                  <button class="text-gray-400 hover:text-blue-500 mx-2"><span class="material-symbols-outlined">edit</span></button>
                  <button class="text-gray-400 hover:text-red-600 mx-2"><span class="material-symbols-outlined">delete</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalculationFactors;
