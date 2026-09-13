# FantasyClub

Camada de organização, comunidade e operação para ligas de Fantasy Sports que já
rodam em plataformas como o **Sleeper**. O Sleeper continua sendo a fonte de
verdade do jogo em si (draft, escalação, waiver, pontuação); o FantasyClub cuida
de tudo o que fica ao redor: temporadas, inscrições, controle financeiro,
histórico dos jogadores, rankings, conquistas e a operação do comissário.

Este é o MVP da primeira validação: **uma liga de NFL real**, rodando durante
o início da temporada de 2026.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4 (tokens em [`src/index.css`](src/index.css) — paleta sem
  verde, ver seção abaixo)
- Componentes baseados em Radix UI + `class-variance-authority`
- Supabase (Postgres + Auth + Row Level Security)
- TanStack Query para cache/estado assíncrono
- React Router v7

## Rodando localmente

```bash
npm install
npm run dev
```

A aplicação funciona **mesmo sem Supabase configurado**: se
`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` não estiverem definidas, todas as
telas usam dados mockados de uma liga fictícia de 12 times (ver
[`src/mocks`](src/mocks)), incluindo login/cadastro simulados. Isso permite
validar a interface e o fluxo completo antes de existir um projeto Supabase.

Outros comandos:

```bash
npm run build   # typecheck + build de produção
npm run lint    # oxlint
npm run preview # serve o build de produção
```

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha com as credenciais do seu projeto
Supabase (Project Settings → API):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Nunca coloque a `service_role key` no frontend — apenas a `anon key`, que é
segura para o navegador porque toda a autorização real é feita via Row Level
Security no banco.

## Banco de dados / migrations

O schema vive em [`supabase/migrations`](supabase/migrations) como SQL puro,
para ser aplicado com a [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <seu-project-ref>
supabase db push
```

Ou cole o conteúdo dos arquivos, em ordem, no SQL Editor do painel Supabase.

- `0001_init_schema.sql` — tabelas, enums, triggers de `updated_at` e o
  gatilho que cria um `profiles` automaticamente no cadastro.
- `0002_rls_policies.sql` — Row Level Security. Cada liga tem um único
  `commissioner_id`; qualquer usuário autenticado pode criar uma liga e vira
  comissário dela — não existe um "admin global" fixo, então a plataforma já
  suporta múltiplos comissários independentes.
- `0003_seed_reference_data.sql` — esportes (NFL ativo, NBA já cadastrado mas
  inativo), a temporada NFL 2026 e o catálogo inicial de conquistas.

### Decisões de modelagem

- **Multi-esporte desde o início**: a hierarquia é
  `sport → season → league → league_membership`, nunca "usuário → liga da
  NFL". Isso permite adicionar NBA (ou outro esporte) sem migração
  estrutural — só uma nova linha em `sports`/`seasons`.
- **Standings e confrontos são um snapshot sincronizado, não uma cópia
  permanente**: `league_memberships` guarda W-L/pontos como cache atualizado a
  cada sincronização, e `matchups` guarda só a rodada mais recente. O Sleeper
  continua sendo a fonte de verdade; não replicamos o histórico completo de
  temporada nem a lógica de pontuação.
- **Financeiro é controle manual, não custódia**: `payments` só registra
  valores esperados/pagos e status — nenhuma integração de pagamento, wallet
  ou repasse automático.

## Integração com Sleeper

Toda a comunicação com a API pública do Sleeper fica isolada em
[`src/services/sleeper`](src/services/sleeper):

- `client.ts` — chamadas HTTP tipadas, sem lógica de negócio.
- `mapper.ts` — traduz o formato do Sleeper (usuários, rosters, matchups) para
  as tabelas do FantasyClub.
- `sync.ts` — orquestra a sincronização de uma liga: busca dados no Sleeper e
  faz upsert em `league_memberships`/`matchups`. Nunca sobrescreve a
  associação manual `user_id` de um participante — o payload de upsert
  simplesmente não inclui essa coluna.
- `errors.ts` — erros tipados (`not_found`, `unavailable`,
  `invalid_response`) traduzidos em mensagens amigáveis na UI; a aplicação
  nunca expõe erro técnico cru ao usuário.

Nenhum componente React chama a API do Sleeper diretamente — sempre passa por
essa camada de serviço.

### Associação jogador ↔ Sleeper

Neste MVP a associação entre um usuário da plataforma e o participante da
liga no Sleeper é **manual**: o comissário faz isso na aba
**Participantes** do painel administrativo.

## Estrutura do projeto

```
src/
  components/ui/       componentes de design system (Button, Card, Badge…)
  components/layout/   PlayerLayout (mobile-first) e AdminLayout (desktop-first)
  context/              AuthContext (Supabase Auth, com fallback mock)
  hooks/                hooks de dados (TanStack Query) por domínio
  services/             camada de acesso a dados — Supabase e Sleeper isolados aqui
  pages/player/         Home, Liga, Ranking, Fantasy Passport
  pages/admin/          Dashboard, Ligas, Financeiro, Premiação, Integração
  mocks/                dados de demonstração usados quando o Supabase não está configurado
  types/                tipos do banco (`database.ts`) e tipos de domínio (`domain.ts`)
supabase/migrations/    schema SQL + RLS + seed
```

## Perfis de usuário

- **Player**: vê suas ligas, classificação, confrontos, perfil e conquistas.
  Não altera dados administrativos.
- **Comissário**: qualquer usuário que crie uma liga vira comissário dela —
  gerencia participantes, financeiro, premiação e a sincronização com o
  Sleeper. A área `/admin` fica disponível para quem comissiona pelo menos
  uma liga.

## Identidade visual

Nenhum tom de verde é usado em nenhum lugar da interface — nem para "pago",
"ativo" ou "sucesso". Estados positivos usam azul ou dourado; alertas usam
âmbar; erros usam vermelho. Os tokens de cor ficam em
[`src/index.css`](src/index.css).
