# Validação prática — Dominó

Data: 11/11/2026. Node.js 24.17.0; Jest 30.5.2; ESM com módulos VM.

## Reconstrução

Uma implementação real das três funções do contrato foi escrita em uma cópia separada,
a partir do README, testes e fixtures. Ela não importa fixtures nem contém respostas
específicas para casos de teste. Nenhuma implementação é distribuída neste repositório.
O mesmo processo de autoria fez a reconstrução; não foi uma avaliação cega por outro avaliador.

- Resultado com essa implementação: **18 testes aprovados, zero falhas e zero ignorados**.
- Cobertura da implementação de ensaio: linhas 100%, funções 92.3%, ramificações 96.2%.
- Sem implementação: `npm ci` instala Jest; `npm test` falha por não encontrar `src/jogo.js`.
- Não há mocks de jogo, `skip`, `todo`, testes exclusivos ou captura de falhas para gerar aprovação.
- Somente fixtures, testes, configuração Jest, lockfile e documentação são entregues.

## Defeitos artificiais detectados

Cada alteração foi aplicada isoladamente ao código de ensaio. O Jest executou os casos
e encontrou pelo menos uma asserção falhando, sem erro de carregamento. A implementação
correta foi restaurada ao final de cada grupo.

| Identificador | Defeito introduzido | Exemplo de teste que detectou |
| --- | --- | --- |
| DO-M1 | Ignorar jogador inicial configurado | DO01 — distribuição 7/7/14, ordem fixa e inicial escolhido |
| DO-M2 | Não orientar peças para encaixar | DO03 — encaixe automático 1,6 à direita |
| DO-M3 | Trocar turno ao comprar | DO07 — compra obrigatória mantém turno e compra do início |
| DO-M4 | Vencer bloqueio com maior soma | DO10 — dois passes bloqueiam e menor soma vence (12 contra 10) |
| DO-M5 | Não zerar passes após jogada | DO13 — jogada após passe real zera contador e encerra por batida |

## Como repetir

1. Executar `npm ci` com Node.js 24.
2. Implementar `src/jogo.js` respeitando as três exportações e o contrato do README.
3. Executar `npm test` e `npm run test:coverage`, sem modificar os testes.

Todos os casos estão em `tests/`. Os cenários de `integracao.test.js` usam ações públicas
para partidas ou fluxos completos, além dos cenários unitários de regras específicas.
As implementações e resultados JSON do ensaio foram preservados separadamente para revisão local.

## Limites do resultado

Estes números demonstram compatibilidade com os cenários executados. Cobertura de linhas
não comprova todas as combinações de regras, e os cinco defeitos selecionados não representam
um teste exaustivo de mutação. Não se afirma correção universal de 100% do jogo.
As variantes e escolhas explícitas do README são parte da especificação.

## Integridade dos arquivos avaliados

SHA-256 dos arquivos de especificação e execução. Este relatório não inclui seu próprio hash.

```text
94a3025f6d28cbd783d020ed881abde7b00b15854e375bab246d76bdac9d4072  fixtures/batida.json
43dda52679dd8a734d3c37664c065460f0a1a764a8b35d47a2f4ecf35bdf4d91  fixtures/bloqueio.json
113e3379859fbf7193352214fecc9dc368fd103c66066ce99de416a4b8028686  fixtures/compra.json
5d831d11f4b968be673012cc7007b6eaa94610fde742f7871c7b2600ef60f844  fixtures/empate.json
28b15b32a811a93f481fd047c9241b9c6da90c57cb14bcd8e83c863d58fdbb75  fixtures/passe_e_batida.json
55e844dd1588275be889f8a82ca0462dbea2d054b3741e1e1559919898a26b1b  fixtures/pecas.json
ba2654fc62e7e62442e08ba2f87cf6ce9cfcea0abbe4926c7725f7f3b75a6ea5  jest.config.js
a921d9ea96a6d234e89d3fc0dea1fbc297bb149967e9824ebec74fbc9ca35dae  package-lock.json
cb3194224312853eff565bc636ecbcee7e19dcd26a4a819c5dd7372ffaa83de0  package.json
7a816665fc813d24b1a1176e20e52689a9fbc760e41b69e6e481ed8f0efa2265  README.md
ca0931fcb5f2fc4560d8819fd2edd9f32fceb62ac8a8b47b69924679187c646c  tests/apoio.js
c8ad7d29453eec47e51aac4a3254b391c9a7f9fb0e4673a8e5c4024c0577f9de  tests/domino.test.js
b62126b9552ae96989a367d77a82a18e4bd0382b1acdafb2dd5647a8b03c626b  tests/integracao.test.js
```
