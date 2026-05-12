# Figurinhas Copa 2026 (front-end)

App **Next.js** para acompanhar o álbum da Copa 2026: marcação tenho/não tenho, progresso geral e por seleção, busca por número e persistência em **localStorage** (MVP).

## Como rodar

```bash
cd web
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). A landing está em `/` e o álbum em `/album`.

## Supabase (opcional)

Para evoluir para sync/login, crie `web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Com as variáveis ausentes, o app continua só com armazenamento local (comportamento atual).

## Checklist Panini (verso)

Ordem global **1–980** e códigos **FWC**, **BRA**, **00** (logo), etc. seguem o checklist público [Scanini](https://scanini.app/albums/world-cup-2026). Confira com o verso das figurinhas ou com o material oficial Panini.

Persistência: chave `localStorage` **`figurinhas-copa-2026-owned-v2`** (incompatível com a v1 após o alinhamento oficial).

## Documentação do produto

Especificações em `../documentos/` (PRD, MVP, landing, design).
