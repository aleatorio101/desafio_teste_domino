# Dominó para dois jogadores — especificação por testes

## Objetivo e especificação do desafio

Partida individual de **dominó duplo-seis para dois jogadores**, com compra e encerramento por batida ou bloqueio.

Entrega individual da disciplina Projeto, Implementação e Teste de Software, 2026.
Este repositório contém **somente testes JavaScript, fixtures e documentação**.
O professor poderá fornecer estes testes a uma IA para construir o jogo.
Não existe implementação, interface gráfica, mock ou solução de referência.

## Colaborador

- [aleatorio101](https://github.com/aleatorio101) — autoria individual dos testes e documentação.

## Execução

Requer Node.js 24 e npm. Não há dependências externas nem necessidade de `npm install`.

```sh
npm test
```

**Situação esperada nesta entrega:** o comando termina com código diferente de zero,
com `ERR_MODULE_NOT_FOUND`, porque `src/jogo.js` ainda não existe. Isso não demonstra
que os cenários passaram. Depois de implementar o contrato abaixo, o mesmo comando
deverá executar todos os casos e passar sem alterações nos testes.
Não desabilitar casos nem transformar falhas em sucesso.

## Contrato para a futura implementação

Criar `src/jogo.js` como ESM e exportar funções síncronas nomeadas:

```js
export function criarJogo(opcoes) { /* futura implementação */ }
export function executarAcao(estado, acao) { /* futura implementação */ }
export function obterVisao(estado, jogador) { /* futura implementação */ }
```

Essas assinaturas são documentação, não arquivos entregues. Estados, ações e opções
são objetos JavaScript simples, serializáveis. `criarJogo` não modifica as opções;
`executarAcao` retorna outro objeto sem modificar o estado, seus objetos internos ou a ação.
`obterVisao` não modifica o estado e retorna cópias sem referências mutáveis a ele.
Estados intermediários das fixtures podem ser passados diretamente a `executarAcao`:
eles são preparação de cenários, não uma implementação alternativa.

Coordenadas usam `linha` e `coluna`, começando em zero. Tipos errados, valores não inteiros
e objetos obrigatórios ausentes geram `TypeError`; inteiros fora do intervalo geram
`RangeError`. Violações de regra geram `Error` com a propriedade `code` indicada no teste.
Uma ação com `tipo` desconhecido gera `ACAO_DESCONHECIDA`. Ações em jogo encerrado geram
`JOGO_ENCERRADO`. A validação da fase de encerramento precede validações de jogadas.
Mensagens de erro são livres; classes e códigos são parte do contrato.


### Regras e contrato

28 peças únicas, de `[0,0]` a `[6,6]`; `[a,b]` e `[b,a]` representam a mesma peça.
Sete peças para cada jogador e 14 no monte. O jogador inicial é explicitamente
selecionado em `opcoes.jogadorInicial` (padrão 0); a primeira peça é livre.
Não é obrigatório iniciar com carroça. Uma partida termina na primeira batida ou bloqueio;
não há placar acumulado, bônus de carroça ou cálculo de pontos por múltiplos de cinco.

`criarJogo({pecas,jogadorInicial:0})`: `pecas` é a sequência obrigatória das 28 peças;
as primeiras sete vão para o jogador 0, as sete seguintes para 1 e o restante para o monte.
Quantidade inválida ou pontos fora de 0..6: `RangeError`; repetidas, inclusive invertidas:
`PECAS_DUPLICADAS`. Estado: `{maos:[[],[]],monte:[],mesa:[],turno,status:'em_andamento',
vencedor:null,motivo:null,passesConsecutivos:0}`. Arrays de peças usam `[a,b]`.
`mesa` é uma cadeia orientada da esquerda para a direita.

Ações:
- `{tipo:'jogar',jogador,peca:[a,b],lado:'esquerda'|'direita'}`: a peça deve estar na mão
  e ser orientada pelo jogo para encaixar. Na mesa vazia, preservar a orientação recebida.
  Erros: `PECA_AUSENTE`, `ENCAIXE_INVALIDO`. Lado inválido: `RangeError`.
- `{tipo:'comprar',jogador}`: só sem encaixe disponível; retira uma peça do início do monte,
  acrescenta à mão e mantém o turno. Repetir compra enquanto não houver encaixe.
  Erros: `JOGADA_DISPONIVEL`, `MONTE_VAZIO`.
- `{tipo:'passar',jogador}`: só sem encaixe e com monte vazio. Erros:
  `JOGADA_DISPONIVEL` ou `COMPRA_OBRIGATORIA`.

Jogada bem-sucedida zera passes e alterna turno. Batida encerra com `status:'encerrado'`,
`vencedor:jogador`, `motivo:'batida'` e mantém o turno de quem bateu.
Dois passes consecutivos encerram por `motivo:'bloqueio'`: vence a menor soma dos pontos
da mão; empate dá `vencedor:null`. No bloqueio, `turno` fica no segundo jogador que passou.
Fora do turno: `FORA_DA_VEZ`. Jogadores são 0 e 1.

`obterVisao(estado,jogador)` retorna exatamente `{mao,quantidadeAdversario,
quantidadeMonte,mesa,turno,status,vencedor,motivo,passesConsecutivos}`.
Não expõe peças adversárias nem a ordem do monte, mesmo depois de encerrar.

Exemplo: `executarAcao(criarJogo({pecas}),{tipo:'jogar',jogador:0,peca:[0,6],lado:'direita'})`.
As fixtures de final de partida conservam todas as 28 peças, sem duplicação.


## Funcionamento dos casos de teste

- `tests/*.test.js`: casos independentes com preparação, ação e resultados observáveis.
- `fixtures/*.json`: entradas fixas e estados intermediários explícitos.
- `tests/apoio.js`: importações, asserções e verificações de imutabilidade; não contém regras.
- As tabelas de casos têm expectativas literais. Laços apenas enumeram dados ou executam ações.
- Usamos `node:test` e `node:assert/strict`; não há `skip`, `todo`, rede, relógio ou aleatoriedade.
- Os prefixos dos casos identificam a regra. Leia cada nome e suas asserções para encontrar
  o comportamento exigido; os exemplos e as tabelas são parte da especificação.

## Critérios de aceitação

Uma implementação compatível preserva todos os testes, passa em `npm test`, respeita
os erros e a imutabilidade e não expõe informação escondida por `obterVisao`.
Os testes publicados não provam cobertura de um programa que ainda não existe;
não há percentual de cobertura ou aprovação funcional alegado nesta entrega.
