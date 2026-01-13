# Meetup :: Playwright + IA: Testes E2E sem drama

## Requisitos

- Docker (para wp-env)
- Node.js 18+

## Comandos

### wp-env (ambiente de teste)

| Comando | Descrição |
| ------- | --------- |
| `npm run env` | Alias para executar comandos wp-env directamente |
| `npm run env:start` | Inicia o ambiente WordPress de teste em `http://localhost:8889` |
| `npm run env:stop` | Para o ambiente WordPress (mantém os dados) |
| `npm run env:clean` | Limpa o ambiente (remove dados mas mantém containers) |
| `npm run env:destroy` | Destrói completamente o ambiente (remove containers e dados) |

### Testes E2E (Playwright)

| Comando | Descrição |
| ------- | --------- |
| `npm run test:e2e` | Executa todos os testes E2E em modo headless. Ideal para CI/CD. |
| `npm run test:e2e:debug` | Modo debug com Playwright Inspector. Pausar e inspecionar seletores. |
| `npm run test:e2e:ui` | Interface gráfica do Playwright (UI Mode). Debug interativo. |
| `npm run test:e2e:headed` | Testes com browser visível. Ver execução em tempo real. |
| `npm run test:e2e:trace` | Testes com tracing. Gera ficheiro para análise detalhada. |

### Testes de Performance

| Comando | Descrição |
| ------- | --------- |
| `npm run test:performance` | Executa testes de performance. Mede Core Web Vitals e métricas de carregamento. |

#### Métricas

**Frontend (20 iterações):**

- TTFB (Time to First Byte)
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- Server-Timing (métricas WordPress)

**Editor (5 iterações):**

- Tempo de resposta do servidor
- First Contentful Paint
- DOM Content Loaded
- Page Load
- Tempo de inserção do bloco
- Tempo de renderização do bloco
- Tempo de abertura do painel de configurações

**Bloco (5 iterações):**

- Tempo de inserção do bloco
- Tempo de renderização do bloco
- Tempo de edição de atributos

**WordPress Server-Timing:**

- Total (wp-total)
- Database (wp-db)
- Cache (wp-cache)

Os resultados são salvos em `artifacts/performance-results/` com estatísticas (mediana, quartis, min/max) e verificação de performance budgets.

### Opções adicionais

Todos os comandos acima aceitam opções adicionais do Playwright:

```bash
# Executar apenas um ficheiro de teste específico
npm run test:e2e -- specs/meetup-info.spec.ts

# Executar apenas testes que contenham "frontend" no nome
npm run test:e2e -- --grep "frontend"

# Executar testes com 2 workers em paralelo
npm run test:e2e -- --workers=2

# Executar testes e actualizar snapshots visuais
npm run test:e2e -- --update-snapshots
```

## Credenciais wp-env

O ambiente wp-env usa as seguintes credenciais por padrão:

- **URL**      : `http://localhost:8889`
- **Admin URL**: `http://localhost:8889/wp-admin`
- **Username** : `admin`
- **Password** : `password`
