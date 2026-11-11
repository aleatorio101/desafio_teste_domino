import {test,expect} from '@jest/globals';
import pecas from '../fixtures/pecas.json' with {type:'json'};
import {criarJogo,agir,proibir} from './apoio.js';
test('DO17 — partida completa com compras sucessivas, encaixes e batida',()=>{
  let e=criarJogo({pecas});
  // Sequência de jogadas e resultados finais especificados manualmente.
  const acoes=[
    [0,[0,1],'direita'],[1,[1,1],'direita'],[0,[0,2],'esquerda'],[1,[1,2],'direita'],
    [0,'comprar'],[0,[2,3],'esquerda'],[1,[2,2],'direita'],[0,[0,3],'esquerda'],
    [1,'comprar'],[1,[2,4],'direita'],[0,[0,0],'esquerda'],[1,[1,4],'direita'],
    [0,[0,4],'esquerda'],[1,[1,3],'direita'],[0,'comprar'],[0,'comprar'],[0,'comprar'],
    [0,[3,3],'direita'],[1,'comprar'],[1,[3,4],'direita'],[0,'comprar'],[0,'comprar'],
    [0,'comprar'],[0,[4,4],'direita'],[1,'comprar'],[1,[4,5],'direita'],[0,[0,5],'direita'],
    [1,'comprar'],[1,[4,6],'esquerda'],[0,[0,6],'direita'],[1,[1,6],'direita'],
    [0,[2,6],'esquerda'],[1,[1,5],'direita']];
  for(let i=0;i<acoes.length;i++) {
    const [jogador,peca,lado]=acoes[i];
    e=agir(e,peca==='comprar'?{tipo:'comprar',jogador}:{tipo:'jogar',jogador,peca,lado});
    if(i<acoes.length-1)expect(e.status).toBe('em_andamento');
    expect(e.maos.flat().length+e.monte.length+e.mesa.length).toBe(28);
  }
  expect(e.status).toBe('encerrado');expect(e.vencedor).toBe(1);expect(e.motivo).toBe('batida');
  expect(e.maos).toEqual([[[2,5],[3,5],[3,6]],[]]);
  expect(e.monte).toEqual([[5,5],[5,6],[6,6]]);expect(e.mesa).toHaveLength(22);
  expect(e.mesa[0][0]).toBe(2);expect(e.mesa.at(-1)[1]).toBe(5);
  proibir(e,{tipo:'comprar',jogador:1},'JOGO_ENCERRADO');
});
