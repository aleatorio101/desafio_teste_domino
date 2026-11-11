import passeEBatida from '../fixtures/passe_e_batida.json' with {type:'json'};
import { expect, test } from "@jest/globals";
import pecas from '../fixtures/pecas.json' with { type: 'json' };
import batida from '../fixtures/batida.json' with { type: 'json' };
import bloqueio from '../fixtures/bloqueio.json' with { type: 'json' };
import empate from '../fixtures/empate.json' with { type: 'json' };
import compra from '../fixtures/compra.json' with { type: 'json' };
import { criarJogo, executarAcao, obterVisao, agir, proibir, visao } from './apoio.js';
const novo = () => criarJogo({
  pecas: structuredClone(pecas),
  jogadorInicial: 0
});
const jogar = (jogador, peca, lado = 'direita') => ({
  tipo: 'jogar',
  jogador,
  peca,
  lado
});
test('DO01 — distribuição 7/7/14, ordem fixa e inicial escolhido', () => {
  const opcoes = {
    pecas: structuredClone(pecas),
    jogadorInicial: 1
  };
  const antes = structuredClone(opcoes);
  const e = criarJogo(opcoes);
  expect(opcoes).toEqual(antes);
  expect(e.maos[0]).toEqual([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]]);
  expect(e.maos[1]).toEqual([[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 2]]);
  expect(e.monte.length).toBe(14);
  expect(e.monte[0]).toEqual([2, 3]);
  expect(e.mesa).toEqual([]);
  expect(e.turno).toBe(1);
  expect(e.status).toBe('em_andamento');
  expect(e.vencedor).toBe(null);
  expect(e.motivo).toBe(null);
  expect(e.passesConsecutivos).toBe(0);
  opcoes.pecas[0][0] = 6;
  expect(e.maos[0][0]).toEqual([0, 0]);
});
test('DO02 — primeira peça é livre e sai da mão', () => {
  const e = agir(novo(), jogar(0, [0, 6]));
  expect(e.mesa).toEqual([[0, 6]]);
  expect(e.maos[0].length).toBe(6);
  expect(e.maos[0].some(p => p[0] === 0 && p[1] === 6)).toBe(false);
  expect(e.turno).toBe(1);
});
for (const [peca, lado, mesa] of [[[1, 6], 'direita', [[0, 6], [6, 1]]], [[6, 1], 'direita', [[0, 6], [6, 1]]]]) test(`DO03 — encaixe automático ${peca} à ${lado}`, () => {
  const e = agir(agir(novo(), jogar(0, [0, 6])), jogar(1, peca, lado));
  expect(e.mesa).toEqual(mesa);
  expect(e.turno).toBe(0);
  expect(e.maos[1].length).toBe(6);
});
test('DO04 — encaixe na esquerda e peça invertida', () => {
  let e = agir(novo(), jogar(0, [0, 6]));
  e = agir(e, jogar(1, [1, 6]));
  e = agir(e, jogar(0, [0, 2], 'esquerda'));
  expect(e.mesa).toEqual([[2, 0], [0, 6], [6, 1]]);
});
test('DO05 — carroça pode encaixar e mantém extremidade', () => {
  let e = agir(novo(), jogar(0, [0, 1]));
  e = agir(e, jogar(1, [1, 1]));
  expect(e.mesa).toEqual([[0, 1], [1, 1]]);
  expect(e.turno).toBe(0);
});
test('DO06 — rejeitar fora da vez, peça ausente e encaixe errado', () => {
  proibir(novo(), jogar(1, [1, 1]), 'FORA_DA_VEZ');
  proibir(novo(), jogar(0, [6, 6]), 'PECA_AUSENTE');
  const e = agir(novo(), jogar(0, [0, 6]));
  proibir(e, jogar(1, [1, 2]), 'ENCAIXE_INVALIDO');
});
test('DO07 — compra obrigatória mantém turno e compra do início', () => {
  const e = agir(compra, {
    tipo: 'comprar',
    jogador: 0
  });
  expect(e.maos[0]).toEqual([[1, 1], [0, 6]]);
  expect(e.monte).toEqual([]);
  expect(e.turno).toBe(0);
  expect(e.status).toBe('em_andamento');
  proibir(compra, {
    tipo: 'passar',
    jogador: 0
  }, 'COMPRA_OBRIGATORIA');
  proibir(e, {
    tipo: 'comprar',
    jogador: 0
  }, 'JOGADA_DISPONIVEL');
});
test('DO08 — sem monte e sem jogada, passar alterna turno', () => {
  const e = agir(bloqueio, {
    tipo: 'passar',
    jogador: 0
  });
  expect(e.turno).toBe(1);
  expect(e.passesConsecutivos).toBe(1);
  expect(e.status).toBe('em_andamento');
  proibir(bloqueio, {
    tipo: 'comprar',
    jogador: 0
  }, 'MONTE_VAZIO');
});
test('DO09 — não comprar ou passar quando há jogada', () => {
  proibir(novo(), {
    tipo: 'comprar',
    jogador: 0
  }, 'JOGADA_DISPONIVEL');
  proibir(novo(), {
    tipo: 'passar',
    jogador: 0
  }, 'JOGADA_DISPONIVEL');
});
test('DO10 — dois passes bloqueiam e menor soma vence (12 contra 10)', () => {
  let e = agir(bloqueio, {
    tipo: 'passar',
    jogador: 0
  });
  e = agir(e, {
    tipo: 'passar',
    jogador: 1
  });
  expect(e.status).toBe('encerrado');
  expect(e.motivo).toBe('bloqueio');
  expect(e.vencedor).toBe(1);
  expect(e.passesConsecutivos).toBe(2);
  expect(e.turno).toBe(1);
  proibir(e, {
    tipo: 'passar',
    jogador: 1
  }, 'JOGO_ENCERRADO');
});
test('DO11 — bloqueio com soma igual empata (12 contra 12)', () => {
  let e = agir(empate, {
    tipo: 'passar',
    jogador: 0
  });
  e = agir(e, {
    tipo: 'passar',
    jogador: 1
  });
  expect(e.status).toBe('encerrado');
  expect(e.motivo).toBe('bloqueio');
  expect(e.vencedor).toBe(null);
});
test('DO12 — última peça encerra por batida', () => {
  const e = agir(batida, jogar(0, batida.maos[0][0], 'esquerda'));
  expect(e.maos[0]).toEqual([]);
  expect(e.status).toBe('encerrado');
  expect(e.vencedor).toBe(0);
  expect(e.motivo).toBe('batida');
  expect(e.turno).toBe(0);
  expect(e.passesConsecutivos).toBe(0);
  proibir(e, jogar(1, batida.maos[1][0]), 'JOGO_ENCERRADO');
});
test('DO13 — jogada após passe real zera contador e encerra por batida', () => {
  let e = agir(passeEBatida, {tipo:'passar',jogador:0});
  expect(e.passesConsecutivos).toBe(1);
  expect(e.turno).toBe(1);
  e = agir(e,jogar(1,[0,0],'direita'));
  expect(e.passesConsecutivos).toBe(0);
  expect(e.status).toBe('encerrado');
  expect(e.motivo).toBe('batida');
  expect(e.vencedor).toBe(1);
});

test('DO14 — visão oculta peças adversárias e monte, retornando cópias', () => {
  const e = novo();
  const v = visao(e, 0);
  expect(v).toEqual({
    mao: e.maos[0],
    quantidadeAdversario: 7,
    quantidadeMonte: 14,
    mesa: [],
    turno: 0,
    status: 'em_andamento',
    vencedor: null,
    motivo: null,
    passesConsecutivos: 0
  });
  v.mao[0][0] = 6;
  expect(e.maos[0][0]).toEqual([0, 0]);
  expect(visao(e, 1).mao).toEqual(e.maos[1]);
});
test('DO15 — preparação exige peças válidas, únicas e completas', () => {
  expect(() => criarJogo({
    pecas: pecas.slice(1)
  })).toThrow(RangeError);
  const repetidas = structuredClone(pecas);
  repetidas[0] = [1, 0];
  expect(() => criarJogo({
    pecas: repetidas
  })).toThrow(expect.objectContaining({
    code: 'PECAS_DUPLICADAS'
  }));
  const fora = structuredClone(pecas);
  fora[0] = [0, 7];
  expect(() => criarJogo({
    pecas: fora
  })).toThrow(RangeError);
  expect(() => criarJogo({
    pecas: '28'
  })).toThrow(TypeError);
});
test('DO16 — tipos, limites, jogador e ação desconhecida', () => {
  expect(() => executarAcao(novo(), jogar(0, [0, 1], 'centro'))).toThrow(RangeError);
  expect(() => executarAcao(novo(), jogar(0, [0, 7]))).toThrow(RangeError);
  expect(() => executarAcao(novo(), jogar(0, ['0', 1]))).toThrow(TypeError);
  expect(() => executarAcao(novo(), jogar(2, [0, 1]))).toThrow(RangeError);
  expect(() => obterVisao(novo(), '0')).toThrow(TypeError);
  expect(() => obterVisao(novo(), 2)).toThrow(RangeError);
  proibir(novo(), {
    tipo: 'embaralhar'
  }, 'ACAO_DESCONHECIDA');
});
