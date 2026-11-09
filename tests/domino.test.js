import test from 'node:test';
import pecas from '../fixtures/pecas.json' with {type:'json'};
import batida from '../fixtures/batida.json' with {type:'json'};
import bloqueio from '../fixtures/bloqueio.json' with {type:'json'};
import empate from '../fixtures/empate.json' with {type:'json'};
import compra from '../fixtures/compra.json' with {type:'json'};
import { assert, criarJogo, executarAcao, obterVisao, agir, proibir, visao } from './apoio.js';
const novo=()=>criarJogo({pecas:structuredClone(pecas),jogadorInicial:0});
const jogar=(jogador,peca,lado='direita')=>({tipo:'jogar',jogador,peca,lado});

test('DO01 — distribuição 7/7/14, ordem fixa e inicial escolhido',()=>{
  const opcoes={pecas:structuredClone(pecas),jogadorInicial:1};const antes=structuredClone(opcoes);
  const e=criarJogo(opcoes);assert.deepEqual(opcoes,antes);
  assert.deepEqual(e.maos[0],[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6]]);
  assert.deepEqual(e.maos[1],[[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[2,2]]);
  assert.equal(e.monte.length,14);assert.deepEqual(e.monte[0],[2,3]);
  assert.deepEqual(e.mesa,[]);assert.equal(e.turno,1);assert.equal(e.status,'em_andamento');
  assert.equal(e.vencedor,null);assert.equal(e.motivo,null);assert.equal(e.passesConsecutivos,0);
  opcoes.pecas[0][0]=6;assert.deepEqual(e.maos[0][0],[0,0]);
});
test('DO02 — primeira peça é livre e sai da mão',()=>{
  const e=agir(novo(),jogar(0,[0,6]));
  assert.deepEqual(e.mesa,[[0,6]]);assert.equal(e.maos[0].length,6);
  assert.equal(e.maos[0].some(p=>p[0]===0&&p[1]===6),false);assert.equal(e.turno,1);
});
for(const [peca,lado,mesa] of [
  [[1,6],'direita',[[0,6],[6,1]]],
  [[6,1],'direita',[[0,6],[6,1]]]
]) test(`DO03 — encaixe automático ${peca} à ${lado}`,()=>{
  const e=agir(agir(novo(),jogar(0,[0,6])),jogar(1,peca,lado));
  assert.deepEqual(e.mesa,mesa);assert.equal(e.turno,0);assert.equal(e.maos[1].length,6);
});
test('DO04 — encaixe na esquerda e peça invertida',()=>{
  let e=agir(novo(),jogar(0,[0,6]));e=agir(e,jogar(1,[1,6]));
  e=agir(e,jogar(0,[0,2],'esquerda'));
  assert.deepEqual(e.mesa,[[2,0],[0,6],[6,1]]);
});
test('DO05 — carroça pode encaixar e mantém extremidade',()=>{
  let e=agir(novo(),jogar(0,[0,1]));e=agir(e,jogar(1,[1,1]));
  assert.deepEqual(e.mesa,[[0,1],[1,1]]);assert.equal(e.turno,0);
});
test('DO06 — rejeitar fora da vez, peça ausente e encaixe errado',()=>{
  proibir(novo(),jogar(1,[1,1]),'FORA_DA_VEZ');
  proibir(novo(),jogar(0,[6,6]),'PECA_AUSENTE');
  const e=agir(novo(),jogar(0,[0,6]));
  proibir(e,jogar(1,[1,2]),'ENCAIXE_INVALIDO');
});
test('DO07 — compra obrigatória mantém turno e compra do início',()=>{
  const e=agir(compra,{tipo:'comprar',jogador:0});
  assert.deepEqual(e.maos[0],[[1,1],[0,6]]);assert.deepEqual(e.monte,[]);
  assert.equal(e.turno,0);assert.equal(e.status,'em_andamento');
  proibir(compra,{tipo:'passar',jogador:0},'COMPRA_OBRIGATORIA');
  proibir(e,{tipo:'comprar',jogador:0},'JOGADA_DISPONIVEL');
});
test('DO08 — sem monte e sem jogada, passar alterna turno',()=>{
  const e=agir(bloqueio,{tipo:'passar',jogador:0});
  assert.equal(e.turno,1);assert.equal(e.passesConsecutivos,1);assert.equal(e.status,'em_andamento');
  proibir(bloqueio,{tipo:'comprar',jogador:0},'MONTE_VAZIO');
});
test('DO09 — não comprar ou passar quando há jogada',()=>{
  proibir(novo(),{tipo:'comprar',jogador:0},'JOGADA_DISPONIVEL');
  proibir(novo(),{tipo:'passar',jogador:0},'JOGADA_DISPONIVEL');
});
test('DO10 — dois passes bloqueiam e menor soma vence (12 contra 10)',()=>{
  let e=agir(bloqueio,{tipo:'passar',jogador:0});e=agir(e,{tipo:'passar',jogador:1});
  assert.equal(e.status,'encerrado');assert.equal(e.motivo,'bloqueio');
  assert.equal(e.vencedor,1);assert.equal(e.passesConsecutivos,2);assert.equal(e.turno,1);
  proibir(e,{tipo:'passar',jogador:1},'JOGO_ENCERRADO');
});
test('DO11 — bloqueio com soma igual empata (12 contra 12)',()=>{
  let e=agir(empate,{tipo:'passar',jogador:0});e=agir(e,{tipo:'passar',jogador:1});
  assert.equal(e.status,'encerrado');assert.equal(e.motivo,'bloqueio');assert.equal(e.vencedor,null);
});
test('DO12 — última peça encerra por batida',()=>{
  const e=agir(batida,jogar(0,batida.maos[0][0],'esquerda'));
  assert.deepEqual(e.maos[0],[]);assert.equal(e.status,'encerrado');
  assert.equal(e.vencedor,0);assert.equal(e.motivo,'batida');assert.equal(e.turno,0);
  assert.equal(e.passesConsecutivos,0);
  proibir(e,jogar(1,batida.maos[1][0]),'JOGO_ENCERRADO');
});
test('DO13 — jogada após passe zera contador',()=>{
  let e=agir(compra,{tipo:'comprar',jogador:0});
  // Mesmo estado físico, com um passe anterior: preparação isolada da regra do contador.
  e={...e,passesConsecutivos:1};e=agir(e,jogar(0,[0,6],'esquerda'));
  assert.equal(e.passesConsecutivos,0);assert.equal(e.status,'em_andamento');
});
test('DO14 — visão oculta peças adversárias e monte, retornando cópias',()=>{
  const e=novo();const v=visao(e,0);
  assert.deepEqual(v,{mao:e.maos[0],quantidadeAdversario:7,quantidadeMonte:14,mesa:[],
    turno:0,status:'em_andamento',vencedor:null,motivo:null,passesConsecutivos:0});
  v.mao[0][0]=6;assert.deepEqual(e.maos[0][0],[0,0]);
  assert.deepEqual(visao(e,1).mao,e.maos[1]);
});
test('DO15 — preparação exige peças válidas, únicas e completas',()=>{
  assert.throws(()=>criarJogo({pecas:pecas.slice(1)}),RangeError);
  const repetidas=structuredClone(pecas);repetidas[0]=[1,0];
  assert.throws(()=>criarJogo({pecas:repetidas}),{code:'PECAS_DUPLICADAS'});
  const fora=structuredClone(pecas);fora[0]=[0,7];
  assert.throws(()=>criarJogo({pecas:fora}),RangeError);
  assert.throws(()=>criarJogo({pecas:'28'}),TypeError);
});
test('DO16 — tipos, limites, jogador e ação desconhecida',()=>{
  assert.throws(()=>executarAcao(novo(),jogar(0,[0,1],'centro')),RangeError);
  assert.throws(()=>executarAcao(novo(),jogar(0,[0,7])),RangeError);
  assert.throws(()=>executarAcao(novo(),jogar(0,['0',1])),TypeError);
  assert.throws(()=>executarAcao(novo(),jogar(2,[0,1])),RangeError);
  assert.throws(()=>obterVisao(novo(),'0'),TypeError);
  assert.throws(()=>obterVisao(novo(),2),RangeError);
  proibir(novo(),{tipo:'embaralhar'},'ACAO_DESCONHECIDA');
});
