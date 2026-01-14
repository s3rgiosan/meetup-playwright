# Meetup :: Playwright + IA: Testes E2E sem drama

* [Slides](https://docs.google.com/presentation/d/1pyBaXg97NVEpwCElGN1BlHMI0cybVu93gNEUJzMsDMk/edit?usp=sharing)
* [AI Prompts](PROMPTS.md)

## Requisitos

- Docker (para wp-env)
- Node.js 18+

## Comandos

### wp-env (ambiente de teste)

| Comando | Descrição |
| ------- | --------- |
| `npm run env` | Alias para executar comandos do wp-env directamente |
| `npm run env:start` | Inicia o ambiente WordPress de teste em `http://localhost:8889` |
| `npm run env:stop` | Pára o ambiente WordPress (mantém os dados) |
| `npm run env:clean` | Limpa o ambiente (remove dados mas mantém containers) |
| `npm run env:destroy` | Destrói completamente o ambiente (remove containers e dados) |

### Testes E2E (Playwright)

| Comando | Descrição |
| ------- | --------- |
| `npm run test:e2e` | Executa todos os testes E2E em modo headless. Ideal para CI/CD. |
| `npm run test:e2e:debug` | Modo debug com Playwright Inspector. Pausar e inspeccionar selectores. |
| `npm run test:e2e:ui` | Interface gráfica do Playwright (UI Mode). Debug interactivo. |
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
- Base de dados (wp-db)
- Cache (wp-cache)

Os resultados são guardados em `artifacts/performance-results/` com estatísticas (mediana, quartis, mínimo/máximo) e verificação de performance budgets.

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

## GitHub Actions

### E2E Tests

Executa automaticamente em push/PR para `main`.

**Funcionalidades:**

- Instala dependências e browsers
- Inicia wp-env
- Executa todos os testes E2E
- Gera relatório HTML
- Upload do relatório HTML como artefacto
- Resumo de testes no Job Summary
- Upload de artefactos (screenshots, traces) em caso de falha

**Ver resultados:**

1. Clica no separador Actions
2. Clica numa execução do workflow "E2E Tests"
3. Vê o resumo no Job Summary
4. Consulta o relatório HTML nos artefactos

### Performance Tests

Executa automaticamente em push/PR para `main`.

**Funcionalidades:**

- Executa testes de performance
- Gera relatório com métricas estatísticas
- **Tabelas formatadas** no Job Summary com:
  - Core Web Vitals (TTFB, FCP, LCP, CLS)
  - Métricas WordPress (Server-Timing)
  - Métricas do editor
  - Métricas do bloco
- **Verificação de performance budgets** (falha se exceder)
- Upload de resultados como artefactos
- Visualização clara com estado (✅/⚠️/❌)

**Performance Budgets:**

- LCP: 2500ms
- FCP: 1800ms
- TTFB: 800ms
- CLS: 0.1

**Ver resultados:**

1. Clica no separador Actions
2. Clica numa execução do workflow "Performance Tests"
3. Vê as tabelas formatadas no Job Summary
4. Consulta os resultados JSON nos artefactos

## Credenciais wp-env

O ambiente wp-env usa as seguintes credenciais por padrão:

- **URL**      : `http://localhost:8889`
- **Admin URL**: `http://localhost:8889/wp-admin`
- **Utilizador**: `admin`
- **Palavra-passe**: `password`

## Inicializar agentes

```bash
npx playwright init-agents --loop=vscode
```
