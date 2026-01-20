import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { supabase } from './lib/supabase';
import OrderList from './pages/OrderList';
import OrderForm from './pages/OrderForm';
import RegistrationList from './pages/RegistrationList';
import RegistrationForm from './pages/RegistrationForm';
import CalculationFactors from './pages/CalculationFactors';
import CalculationFactorForm from './pages/CalculationFactorForm';
import CommissionPage from './pages/CommissionPage';
import ReportsPage from './pages/ReportsPage';
import ReceivablesPage from './pages/ReceivablesPage';
import PayablesPage from './pages/PayablesPage';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email || '');
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowMenu(false);
    // Optional: Navigate to login if it existed, or just refresh
    window.location.reload();
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/pedido');
    if (path === '/financeiro') return location.pathname === '/receivables' || location.pathname === '/payables';
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { name: 'Pedidos', path: '/' },
    { name: 'Cadastros', path: '/cadastros' },
    { name: 'Financeiro', path: '/financeiro' },
    { name: 'Comissões', path: '/comissoes' },
    { name: 'Relatórios', path: '/relatorios' },
    { name: 'Fatores', path: '/configuracoes' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 mr-8">
              <span className="material-icons-outlined text-blue-500 text-2xl">diamond</span>
              <span className="font-bold text-lg text-gray-900">Cristal Brindes</span>
            </Link>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8 h-full items-center">
              {menuItems.map((item) => (
              <div key={item.name} className="relative h-full flex items-center group">
                <Link
                  key={item.name}
                  to={item.name === 'Financeiro' ? '/receivables' : item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.name}
                  {item.name === 'Financeiro' && (
                    <span className="ml-1 material-icons-outlined text-xs">expand_more</span>
                  )}
                </Link>
                {item.name === 'Financeiro' && (
                    <div className="hidden group-hover:block absolute top-14 left-0 w-48 bg-white border border-gray-200 shadow-lg rounded-md py-1 z-50">
                        <Link to="/receivables" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Contas a Receber</Link>
                        <Link to="/payables" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Contas a Pagar</Link>
                    </div>
                )}
              </div>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-1 rounded-full text-gray-400 hover:text-gray-500">
              <span className="material-icons-outlined">notifications</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold focus:outline-none ring-2 ring-offset-2 ring-transparent focus:ring-blue-500 cursor-pointer"
              >
                CB
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-20 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Logado como</p>
                      <p className="text-xs font-bold text-gray-900 truncate">{userEmail || 'Usuário'}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                    >
                      <span className="material-icons-outlined text-sm">logout</span> Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer: React.FC = () => (
  <footer className="bg-white border-t border-gray-200 mt-auto">
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <p className="text-center text-xs text-gray-400">© 2023 Cristal Brindes. Todos os direitos reservados.</p>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
        <Toaster position="top-right" richColors />
        <Header />
        <main className="flex-1 py-8">
          <Routes>
            <Route path="/" element={<OrderList />} />
            <Route path="/pedido/novo" element={<OrderForm />} />
            <Route path="/pedido/:id" element={<OrderForm />} />
            <Route path="/cadastros" element={<RegistrationList />} />
            <Route path="/cadastros/novo" element={<RegistrationForm />} />
            <Route path="/comissoes" element={<CommissionPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route path="/receivables" element={<ReceivablesPage />} />
            <Route path="/payables" element={<PayablesPage />} />
            <Route path="/configuracoes" element={<CalculationFactors />} />
            <Route path="/configuracoes/fatores/novo" element={<CalculationFactorForm />} />
            <Route path="*" element={<OrderList />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;