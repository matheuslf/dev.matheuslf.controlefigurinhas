# BRIEF.md

## Problema
Controlar figurinhas do álbum da Copa do Mundo 2026 manualmente em papel é lento, cansativo e fácil de perder.

## Solução
Uma plataforma simples e responsiva para marcar rapidamente quais figurinhas do álbum já foram adquiridas.

## Público
- Crianças colecionando o álbum da Copa 2026
- Pais ajudando no controle do álbum

## Diferencial
Extremamente simples, rápida e otimizada para uso em celular.

## Modelo de negócio
Inicialmente uso pessoal/familiar.
Possível expansão futura para SaaS gratuito com recursos premium.

## Métricas de sucesso
- Usuário consegue atualizar figurinhas em menos de 10 segundos
- Substituição completa do controle em papel
- Uso recorrente durante o período da Copa
- Taxa alta de retorno diário/semanal

---

# PRD.md

# Visão Geral
A aplicação permitirá que usuários acompanhem o progresso do álbum da Copa do Mundo 2026 marcando figurinhas adquiridas.

O foco principal é simplicidade extrema, especialmente para crianças.

---

# Objetivos do Produto

- Eliminar o controle manual em papel
- Facilitar acompanhamento do álbum
- Tornar o processo rápido e divertido
- Funcionar perfeitamente em celular e desktop

---

# Personas

## Persona 1 — Criança Colecionadora
- Idade: 8–12 anos
- Usa principalmente celular/tablet
- Quer marcar figurinhas rapidamente
- Tem baixa tolerância a interfaces complexas

## Persona 2 — Pai/Mãe
- Ajuda no controle
- Quer visualizar progresso rapidamente
- Usa desktop ocasionalmente

---

# User Stories

## Controle de figurinhas
- Como usuário
- Quero marcar uma figurinha como adquirida
- Para controlar meu progresso no álbum

## Visualização por seleção
- Como usuário
- Quero visualizar figurinhas agrupadas por seleção
- Para encontrar rapidamente uma figurinha

## Progresso do álbum
- Como usuário
- Quero ver quantas figurinhas faltam
- Para acompanhar meu progresso

## Persistência
- Como usuário
- Quero que meu progresso fique salvo
- Para não perder minhas marcações

---

# Requisitos Funcionais

## RF01 — Álbum pré-carregado
O sistema deve conter:
- Seleções da Copa 2026
- Numeração das figurinhas
- Organização por grupo/seleção

## RF02 — Marcação de figurinhas
Usuário deve conseguir:
- marcar figurinha como “tenho”
- desmarcar figurinha

## RF03 — Indicador visual
Figurinhas marcadas devem possuir:
- cor diferente
- feedback visual imediato

## RF04 — Progresso geral
Sistema deve mostrar:
- total de figurinhas
- quantidade adquirida
- quantidade faltando
- percentual completo

## RF05 — Progresso por seleção
Sistema deve mostrar progresso individual por seleção.

## RF06 — Persistência de dados
As marcações devem permanecer salvas entre sessões.

## RF07 — Responsividade
Interface deve funcionar:
- celular
- tablet
- desktop

---

# Requisitos Não Funcionais

## Performance
- Interface deve responder instantaneamente ao toque/click
- Tempo de carregamento inferior a 2 segundos

## UX
- Botões grandes
- Navegação simples
- Pouco texto
- Visual limpo

## Acessibilidade
- Contraste adequado
- Área de toque confortável

---

# Stack Técnica

## Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend
- Supabase

## Arquitetura
- Client-side first
- Mínimo de server-side

---

# Estrutura de Dados (Supabase)

## Tabela: stickers

Campos:
- id
- number
- team
- group

## Tabela: user_stickers

Campos:
- id
- user_id
- sticker_id
- owned (boolean)

---

# Edge Cases

- Usuário marca/desmarca rapidamente
- Álbum incompleto no seed inicial
- Usuário sem login
- Mudança de dispositivo
- Uso offline temporário

---

# Critérios de Aceitação

## Marcação
- Clique/toque altera estado imediatamente
- Estado permanece salvo após reload

## Progresso
- Contadores atualizam em tempo real

## Responsividade
- Aplicação totalmente utilizável em celular

---

# MVP-SCOPE.md

# MUST HAVE

- Álbum pré-carregado
- Seleções organizadas
- Lista numerada de figurinhas
- Marcação “tenho/não tenho”
- Persistência de dados
- Barra de progresso
- Responsividade

---

# SHOULD HAVE

- Busca por número
- Filtro por seleção
- Animação leve ao marcar

---

# COULD HAVE

- Compartilhar progresso
- Tema dark mode
- Sons leves/gamificação

---

# FORA DO MVP

- Sistema de trocas
- Chat
- OCR por câmera
- Marketplace
- Múltiplos álbuns
- Social features

---

# Hipóteses

- Crianças preferem toque rápido vs formulários
- Interface simples aumenta frequência de uso
- Pais ajudam no controle ocasionalmente

---

# Métricas do MVP

- Tempo médio para marcar figurinha
- Frequência de retorno
- Quantidade de figurinhas marcadas
- Uso recorrente semanal

---

# LANDING-PAGE-SPEC.md

# Objetivo da Landing

Explicar rapidamente o produto e levar usuário para começar o controle do álbum.

---

# Estrutura

## 1. Hero Section

### Objetivo
Explicar o produto em 5 segundos.

### Layout
- Headline principal
- Subheadline curta
- Mockup do app
- CTA principal

### Elementos Visuais
- Interface do álbum
- Barra de progresso
- Cards clean

### CTA
- “Começar meu álbum”

---

## 2. Como Funciona

### Objetivo
Mostrar simplicidade.

### Layout
3 passos horizontais:
1. Escolha seleção
2. Marque figurinhas
3. Veja progresso

### Elementos Visuais
- Ícones grandes
- Fluxo simples

---

## 3. Preview do Álbum

### Objetivo
Mostrar interface real.

### Layout
- Grid de figurinhas
- Exemplos marcados
- Progresso visual

---

## 4. Benefícios

### Objetivo
Mostrar vantagens vs papel.

### Layout
Cards simples.

### Possíveis tópicos
- Mais rápido
- Nunca perde
- Funciona no celular
- Fácil para crianças

---

## 5. CTA Final

### Objetivo
Converter usuário.

### Layout
- CTA centralizado
- Mockup leve ao fundo

---

# DESIGN-GUIDELINES.md

# Estilo Visual

Referências:
- Linear
- Resend
- Vercel

Visual:
- clean
- moderno
- minimalista
- light mode

---

# Paleta

## Primária
- Azul: #2563EB

## Secundária
- Verde sucesso: #22C55E

## Neutros
- Fundo: #FFFFFF
- Card: #F8FAFC
- Bordas: #E2E8F0
- Texto principal: #0F172A
- Texto secundário: #64748B

---

# Tipografia

## Fonte
- Inter

## Escala
- Hero: 48px
- Título: 32px
- Subtítulo: 24px
- Texto padrão: 16px
- Labels: 14px

---

# Espaçamento

- Base spacing: 8px
- Seções: 80–120px
- Cards: 24px

---

# Radius

- Cards: rounded-2xl
- Inputs: rounded-xl
- Botões: rounded-xl

---

# Sombras

## Cards
- shadow-sm

## Hover
- shadow-md

---

# Guia shadcn/ui

## Componentes principais

### Card
Usar para:
- seleções
- progresso
- estatísticas

### Button
Usar para:
- marcar ações
- CTA principal

### Progress
Usar para:
- progresso do álbum
- progresso por seleção

### Tabs
Usar para:
- navegar entre grupos/seleções

### Badge
Usar para:
- status
- contadores

---

# Diretrizes de UX

- Área de toque grande
- Feedback visual instantâneo
- Evitar modais complexos
- Evitar excesso de texto
- Priorizar velocidade de interação
- Interface