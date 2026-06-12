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

**1010 figurinhas** na ordem física do álbum:

1. Logo Panini (`00`) + História da Copa (`FWC` 1–19)
2. **Grupos A–L** — 48 seleções (20 figurinhas cada, código no verso ex. `MEX 1`, `BRA 7`)
3. **LEG** 1–16 — Lendas históricas
4. **COC** 1–14 — Craques Coca-Cola

Códigos do verso (`BRA 7`, `LEG 5`, `COC 10`) permanecem como no material Panini; apenas a posição global no checklist (1–1010) segue a ordem dos grupos.

Persistência local: chave **`figurinhas-copa-2026-v4`**. Coleções salvas na v3 (ordem Scanini) são remapeadas automaticamente por código do verso.

## Documentação do produto

Especificações em `../documentos/` (PRD, MVP, landing, design).
