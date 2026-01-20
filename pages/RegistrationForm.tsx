import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Utils de formatação
const formatDoc = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4").substring(0, 14);
  }
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5").substring(0, 18);
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3").substring(0, 14);
  }
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3").substring(0, 15);
};

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<'TYPE' | 'FORM'>('TYPE');
  const [partnerType, setPartnerType] = useState<'CLIENTE' | 'FORNECEDOR'>('CLIENTE');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    doc: '',
    phone: '',
    email: '',
    financial_email: ''
  });

  const handleSelectType = (type: 'CLIENTE' | 'FORNECEDOR') => {
    setPartnerType(type);
    setActiveStep('FORM');
    // Limpar formulário ao mudar o tipo
    setFormData({ name: '', doc: '', phone: '', email: '', financial_email: '' });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Validação básica
    if (!formData.name || !formData.doc || !formData.phone || !formData.email) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('partners').insert([{
        type: partnerType,
        name: formData.name,
        doc: formData.doc,
        phone: formData.phone,
        email: formData.email,
        financial_email: formData.financial_email
      }]);

      if (error) throw error;

      alert(`Cadastro de ${partnerType} salvo com sucesso!`);
      navigate('/cadastros');
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      // Tratamento de erro específico para duplicidade ou violação de constraints
      if (err.code === '23505') {
        alert('Erro: Já existe um cadastro com este CNPJ/CPF ou Nome.');
      } else {
        alert(`Erro ao salvar: ${err.message || 'Erro desconhecido'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 flex items-center">
        <button 
          onClick={() => activeStep === 'FORM' ? setActiveStep('TYPE') : navigate('/cadastros')} 
          className="mr-4 p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 border border-gray-200 text-gray-500 transition-colors"
        >
          <span className="material-icons-outlined text-xl">arrow_back</span>
        </button>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center gap-3">
          <span className="material-icons-outlined text-blue-500 text-3xl">person_add</span>
          NOVO CADASTRO
        </h2>
      </div>

      {activeStep === 'TYPE' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={() => handleSelectType('CLIENTE')}
            className="group flex flex-col items-center justify-center p-12 bg-white border-2 border-transparent hover:border-blue-500 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-icons-outlined text-4xl">person</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">CLIENTE</h3>
            <p className="text-sm text-gray-500 text-center">Cadastrar pessoa física ou jurídica para faturamento de pedidos.</p>
          </button>

          <button 
            onClick={() => handleSelectType('FORNECEDOR')}
            className="group flex flex-col items-center justify-center p-12 bg-white border-2 border-transparent hover:border-emerald-500 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-icons-outlined text-4xl">local_shipping</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">FORNECEDOR</h3>
            <p className="text-sm text-gray-500 text-center">Cadastrar parceiro para fornecimento de produtos ou personalização.</p>
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-2xl rounded-3xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-gray-50 px-8 py-6 border-b flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900 uppercase">Preencha os Dados: {partnerType}</h3>
              <p className="text-xs text-gray-400 font-medium">Todos os campos marcados com * são obrigatórios</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${partnerType === 'CLIENTE' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {partnerType}
            </span>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome / Razão Social *</label>
                <input 
                  className="form-input w-full rounded-xl border-gray-300 py-3 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Nome completo ou Razão Social"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">CNPJ / CPF *</label>
                <input 
                  className="form-input w-full rounded-xl border-gray-300 py-3" 
                  placeholder="00.000.000/0000-00"
                  value={formData.doc}
                  onChange={(e) => handleChange('doc', formatDoc(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Telefone *</label>
                <input 
                  className="form-input w-full rounded-xl border-gray-300 py-3" 
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">E-mail *</label>
                <input 
                  type="email"
                  className="form-input w-full rounded-xl border-gray-300 py-3" 
                  placeholder="contato@empresa.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">E-mail Financeiro</label>
                <input 
                  type="email"
                  className="form-input w-full rounded-xl border-gray-300 py-3" 
                  placeholder="financeiro@empresa.com"
                  value={formData.financial_email}
                  onChange={(e) => handleChange('financial_email', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-4 bg-blue-500 text-white font-black rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-[0.98] transition-all uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'SALVANDO...' : 'SALVAR CADASTRO'}
              </button>
              <button 
                onClick={() => setActiveStep('TYPE')}
                className="px-8 py-4 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-colors uppercase text-sm"
              >
                VOLTAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
