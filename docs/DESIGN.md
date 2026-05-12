---
name: design-system
description: Decisões de design (tema, tipografia, restrições visuais). Consolida ADRs 0001 e 0002 originais.
version: 0.2.0
status: vigente
related:
  - PLAN.md
  - INFO.md
---

# DESIGN — Sistema de design

Estilo wireframe minimalista, paleta reduzida, tokenização total. Inspiração visual: catálogos Amazon limpos + sobriedade Vercel/OpenAI.

## 1. Tema (light único)

### Decisão

- **Tema único `light`** — sem dark, sem system, sem toggle. Decisão de produto em 2026-05.
- Página em branco puro, cartões brancos, texto preto, bordas neutras discretas.
- Toda cor usada na UI referencia tokens semânticos em `:root`. Zero cor crua espalhada nos componentes.

### Tokens vigentes (`app/globals.css` + espelhados em `lib/brand.ts` pra `next/og`)

**Sistema base** (Tailwind/Shadcn-like):
`--background`, `--foreground`, `--muted`, `--muted-foreground`, `--border`, `--primary`, `--primary-foreground`, `--card`, `--card-foreground`, `--popover`, `--popover-foreground`, `--secondary`, `--secondary-foreground`, `--accent`, `--accent-foreground`.

**Marca + página:**
| Token CSS | Valor | Utility Tailwind |
| --- | --- | --- |
| `--brand` | `#169485` (teal Mimos) | `bg-brand`, `text-brand` |
| `--page-canvas` | `#bac2f9` (lavanda) | `bg-page-canvas` |
| `--cta` | `#FFC313` | `bg-cta` |
| `--cta-foreground` | `oklch(0 0 0)` (preto) | `text-cta-foreground` |

**Marketplaces (pares fundo + texto):**
| Marketplace | Fundo | Texto |
| --- | --- | --- |
| Shopee | `bg-shopee` (`#EE4D2D`) | `text-shopee-foreground` (branco) |
| Mercado Livre | `bg-mercadolivre` (`#FFE600`) | `text-mercadolivre-foreground` (preto) |
| Amazon | `bg-amazon` (`#FF9900`) | `text-amazon-foreground` (preto) |

**Radius:**
| Token | Valor | Utility | Aplicado a |
| --- | --- | --- | --- |
| `--radius` | `0` | `rounded-sm/md/lg/xl` (todos = 0) | wireframe geral, inputs eventuais |
| `--radius-pill` | `20px` | `rounded-pill` | **TODAS** as caixas e botões: card, CTA, badges, chip de contagem, botão "Tentar novamente" |

> Decisão: 30px é uniforme entre componentes (de pequeno como badge a grande como card). Em elementos pequenos vira pill perfeito (raio > altura/2), em cards grandes vira canto suavemente arredondado. Mesma medida, escalas visuais coerentes.

### Restrições visuais globais

- Sem `box-shadow` decorativo
- Sem `text-shadow`, sem filtros de "glow"
- Sem gradientes
- Sem emojis como ícones (somente Phosphor)
- `--radius: 0` (cantos retos reforçando o wireframe)
- Foco visível via `outline` (token), não via brilho difuso

### Status

Aplicado integralmente no código. Nenhuma divergência conhecida.

## 2. Tipografia

### Decisão

- Fonte única **Figtree**, carregada via `next/font/google` no layout raiz.
- **Título da página (H1):** 24px / 600.
- **Nome do produto no card:** 20px / 700 / line-height 20px.
- **Preço do produto no card:** estilo varejo brasileiro (Submarino/Americanas/Mercado Livre). Reais 24px / 800, `R$` e centavos 14px / 700, `tabular-nums`. Componente `<Price>` em `components/price.tsx`.
- **CTA "Eu quero":** 18px / 700 / uppercase / `border-radius: 30px` / fundo `#FFC313` / texto preto / sem borda (flat) / sem ícone.
- **Badges de marketplace:** 11px / 600 / uppercase / tracking-wider / `border-radius: 30px` / cores de marca por plataforma:
  - Shopee: fundo `#EE4D2D` / texto branco
  - Mercado Livre: fundo `#FFE600` / texto preto
  - Amazon: fundo `#FF9900` / texto preto
- **Outros labels e metadados:** 11px-14px / 500.
- **Corpo geral:** 16px (token `--font-size-body`).

### Histórico

ADR original (2026-04) definia nome do produto a 16px pra densidade do grid de 6 colunas. **Revisado em 2026-05** por decisão de produto: títulos a 24px aumentam legibilidade na vitrine, com `line-clamp-2 min-h-[60px]` evitando que cards de altura variável quebrem o grid.

### Tokens tipográficos

`--font-size-title: 24px`, `--font-size-body: 16px`, `--line-height-title`, `--line-height-body`.

### Status

Aplicado integralmente. Nenhuma divergência.

## 3. Layout

Grade responsiva mobile-first em `gap-4`:

| Breakpoint | Colunas |
| --- | --- |
| < 640px | 1 |
| ≥ 640px | 2 |
| ≥ 768px | 3 |
| ≥ 1024px | 4 |
| ≥ 1280px | 6 |

Cada card tem borda 1px própria, leitura tipo planilha.

## 4. Animação

Framer Motion contido: fade-in + stagger curto na entrada do grid. Sem hover dramático, sem easing exótico.

## 5. Acessibilidade (status)

- `alt` das imagens preenchido com o título do produto
- Foco visível mantido (sem `outline: none`)
- Contraste assumido AA pelos tokens oklch — **auditoria formal pendente** (ver `TASK.md` Grupo 12)

## 6. Decisões revogadas

- **"Fundo preto também no modo claro"** — rejeitado: conflita com leitura longa e contraste de imagens de produto. Se stakeholder pedir de novo, abrir novo ADR (impacto forte em WCAG).
- **"Tema único escuro sem toggle"** — rejeitado: spec pede ambos.
- **"Nome de produto a 24px"** — rejeitado: grid de 6 colunas quebraria; documentado como alternativa caso volte à mesa.
