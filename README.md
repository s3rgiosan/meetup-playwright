# Meetup :: Playwright + IA: Testes E2E sem drama

## Requisitos

- Docker (para wp-env)
- Node.js 18+

## Comandos

### wp-env (ambiente de teste)

| Comando | Descrição |
| ------- | --------- |
| `npm run env` | Alias para executar comandos wp-env diretamente |
| `npm run env:start` | Inicia o ambiente WordPress de teste em `http://localhost:8889` |
| `npm run env:stop` | Para o ambiente WordPress (mantém os dados) |
| `npm run env:clean` | Limpa o ambiente (remove dados mas mantém containers) |
| `npm run env:destroy` | Destrói completamente o ambiente (remove containers e dados) |

### Testes E2E (Playwright)

| Comando | Descrição |
| ------- | --------- |
| `npm run test:e2e` | Executa todos os testes E2E em modo headless (sem interface gráfica). Ideal para CI/CD e execução rápida. |
| `npm run test:e2e:debug` | Executa os testes em modo debug com Playwright Inspector. Permite pausar execução, inspecionar seletores e executar passo a passo. |
| `npm run test:e2e:ui` | Abre a interface gráfica do Playwright (UI Mode). Permite visualizar, executar e debug de testes interativamente. **Melhor opção para demos!** |
| `npm run test:e2e:headed` | Executa os testes com o browser visível. Útil para ver a execução em tempo real sem pausas. |
| `npm run test:e2e:trace` | Executa os testes com tracing habilitado. Gera um arquivo de trace que pode ser visualizado no Trace Viewer para análise detalhada de falhas. |

#### Opções adicionais

Todos os comandos acima aceitam opções adicionais do Playwright. Exemplos:

```bash
# Executar apenas um arquivo de teste específico
npm run test:e2e -- specs/meetup-info.spec.ts

# Executar apenas testes que contenham "frontend" no nome
npm run test:e2e -- --grep "frontend"

# Executar testes com 2 workers em paralelo
npm run test:e2e -- --workers=2

# Executar testes e atualizar snapshots
npm run test:e2e -- --update-snapshots
```

## Credenciais wp-env

O ambiente wp-env usa as seguintes credenciais por padrão:

- **URL**      : `http://localhost:8889`
- **Admin URL**: `http://localhost:8889/wp-admin`
- **Username** : `admin`
- **Password** : `password`
