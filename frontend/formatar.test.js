import { describe, expect, it } from 'vitest';
import { data, km, moeda, plural, textoVencimento } from './formatar';

describe('formatação', () => {
  it('formata moeda em reais', () => {
    expect(moeda(3250).replace(/\s/g, ' ')).toBe('R$ 3.250,00');
    expect(moeda(90).replace(/\s/g, ' ')).toBe('R$ 90,00');
    expect(moeda(null).replace(/\s/g, ' ')).toBe('R$ 0,00');
  });

  it('formata quilometragem com separador de milhar', () => {
    expect(km(62340)).toBe('62.340 km');
    expect(km(0)).toBe('0 km');
  });

  it('converte data ISO para dd/mm/aaaa sem mudar o dia', () => {
    expect(data('2026-10-14')).toBe('14/10/2026');
    expect(data('2026-01-01')).toBe('01/01/2026');
    expect(data(null)).toBe('');
  });

  it('usa singular e plural', () => {
    expect(plural(1, 'dia', 'dias')).toBe('1 dia');
    expect(plural(15, 'dia', 'dias')).toBe('15 dias');
  });
});

describe('textoVencimento', () => {
  const revisao = { origem: 'revisao', status: 'atencao', km_restantes: 1200, dias_restantes: 44 };

  it('mostra o que falta para uma revisão', () => {
    expect(textoVencimento(revisao)).toBe('Faltam 1.200 km ou 44 dias');
  });

  it('avisa quando a revisão passou do km ou do prazo', () => {
    expect(textoVencimento({ ...revisao, status: 'vencido', km_restantes: -300 })).toBe('Passou 300 km do prazo');
    expect(textoVencimento({ ...revisao, status: 'vencido', km_restantes: 500, dias_restantes: -10 })).toBe(
      'Prazo vencido há 10 dias'
    );
  });

  it('descreve o prazo de documentos', () => {
    const doc = { origem: 'documento', dias_restantes: 15 };
    expect(textoVencimento(doc)).toBe('Vence em 15 dias');
    expect(textoVencimento({ ...doc, dias_restantes: 1 })).toBe('Vence em 1 dia');
    expect(textoVencimento({ ...doc, dias_restantes: 0 })).toBe('Vence hoje');
    expect(textoVencimento({ ...doc, dias_restantes: -3 })).toBe('Venceu há 3 dias');
  });
});
