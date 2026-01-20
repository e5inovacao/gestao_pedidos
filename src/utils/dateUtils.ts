/**
 * Utilitários para formatação e manipulação de datas no padrão brasileiro (DD/MM/AAAA)
 */

/**
 * Formata uma string de data (ISO YYYY-MM-DD ou Date object) para DD/MM/AAAA
 * Garante o fuso horário correto para não subtrair um dia.
 */
export const formatDate = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return '-';

  try {
    const date = new Date(dateValue);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return '-';

    // Ajuste de fuso horário: Adiciona o offset do timezone para garantir que pegamos o dia UTC correto
    // Ou simplesmente usa getUTCDate() se a string for YYYY-MM-DD pura.
    // Mas strings YYYY-MM-DD são interpretadas como UTC no construtor Date(), 
    // enquanto new Date(Y, M, D) é local.
    // Para simplificar e evitar erros de -1 dia: vamos tratar a string ISO manualmente se possível
    
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      const [year, month, day] = dateValue.split('-');
      return `${day}/${month}/${year}`;
    }

    // Fallback para objetos Date ou timestamps completos
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  } catch (e) {
    return '-';
  }
};

/**
 * Valida se uma string YYYY-MM-DD é uma data válida
 */
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  // Regex simples para YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Retorna a data atual em YYYY-MM-DD (para inputs type="date")
 */
export const getTodayISO = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Formata mês e ano para exibição (ex: JANEIRO de 2024)
 */
export const formatMonthYear = (month: number, year: number): string => {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase();
};
