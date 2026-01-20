
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CalculationFactorForm: React.FC = () => {
  const navigate = useNavigate();
  const [tax, setTax] = useState(10);
  const [contingency, setContingency] = useState(5);
  const [margin, setMargin] = useState(20);
  const [result, setResult] = useState(1.35);

  useEffect(() => {
    const total = 1 + (tax / 100) + (contingency / 100) + (margin / 100);
    setResult(parseFloat(total.toFixed(2)));
  }, [tax, contingency, margin]);

  return (
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="md:flex md:items-center md:justify-between mb-8">
        <div class="flex-1 min-w-0">
          <nav class="flex mb-2">
            <ol class="flex items-center space-x-2 text-sm text-gray-400">
              <li><span class="material-icons-outlined text-sm">settings</span></li>
              <li><span class="material-icons-outlined text-xs">chevron_right</span></li>
              <li class="hover:text-gray-600 cursor-pointer" onClick={() => navigate('/configuracoes')}>Fatores de Cálculo</li>
            </ol>
          </nav>
          <h2 class="text-2xl font-bold text-gray-900 sm:text-3xl flex items-center gap-3">
            <span class="material-symbols-outlined text-blue-500 text-3xl">calculate</span>
            Adicionar Novo Fator
          </h2>
          <p class="mt-1 text-sm text-gray-500">Configure os parâmetros para criação automática de preços de venda.</p>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div class="px-6 py-4 border-b bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">Informações Básicas</h3>
            <p class="text-sm text-gray-500">Defina o nome e a finalidade deste fator.</p>
          </div>
          <div class="p-6 space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nome do Fator</label>
              <input type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ex: Imposto Padrão Vendas" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea rows={3} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Breve explicação sobre quando aplicar este fator."></textarea>
            </div>
          </div>
        </div>

        <div class="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          <div class="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <div>
              <h3 class="text-lg font-medium text-gray-900">Composição do Cálculo</h3>
              <p class="text-sm text-gray-500">Insira as porcentagens para compor o multiplicador.</p>
            </div>
            <div class="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-md border border-blue-100 text-blue-500 text-xs font-medium">
              <span class="material-symbols-outlined text-sm">info</span> Cálculo em tempo real
            </div>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-6">
              {[
                { label: 'Imposto (%)', value: tax, setter: setTax },
                { label: 'Imprevisto (%)', value: contingency, setter: setContingency },
                { label: 'Margem (%)', value: margin, setter: setMargin },
              ].map(field => (
                <div key={field.label}>
                  <label class="block text-sm font-medium text-gray-700">{field.label}</label>
                  <div class="mt-1 relative">
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.setter(Number(e.target.value))}
                      class="block w-full pr-12 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                </div>
              ))}
            </div>
            <div class="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center border border-gray-200">
              <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Fator Resultante</h4>
              <div class="text-5xl font-extrabold text-blue-500 mb-2">{result}</div>
              <div class="w-full border-t border-gray-200 my-4"></div>
              <div class="w-full space-y-2 text-sm text-gray-600">
                <div class="flex justify-between"><span>Base:</span><span>1.00</span></div>
                <div class="flex justify-between"><span>+ Imposto:</span><span>{(tax / 100).toFixed(2)}</span></div>
                <div class="flex justify-between"><span>+ Imprevisto:</span><span>{(contingency / 100).toFixed(2)}</span></div>
                <div class="flex justify-between"><span>+ Margem:</span><span>{(margin / 100).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 pb-8">
          <button onClick={() => navigate(-1)} class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
          <button class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600">Salvar Fator</button>
        </div>
      </div>
    </div>
  );
};

export default CalculationFactorForm;
