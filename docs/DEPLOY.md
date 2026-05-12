---
name: deploy-mimoskorea-shop
description: Checklist e arquivos pra subir o catálogo no servidor (Debian 12, Nginx, PM2). CI/CD via GitHub Actions.
---

# Deploy — Mimos Korea Shop

Stack do servidor:
- **OS:** Debian 12
- **Proxy:** Nginx (já configurado; convive com WordPress + data-analysis)
- **Process manager:** PM2 (mesmo padrão do `mimoskorea-data-analysis`)
- **Node:** 22+ (verificar com `node -v`)
- **Domínio:** `mimoskorea.com.br/shop` (catálogo público, indexável)
- **Porta interna:** `3002` (atrás do Nginx)
- **Tokens persistentes:** `/var/lib/mimoskorea-shop/tokens.json`

---

## Arquivos deste diretório

| Arquivo | Destino no servidor | Quando aplicar |
| --- | --- | --- |
| [`nginx.conf`](nginx.conf) | `/etc/nginx/sites-available/mimoskorea.com.br` | Uma vez + sempre que adicionar/remover sub-rotas |

E na raiz do repo: [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) — CI/CD que dispara em `push main`.

---

## Primeiro deploy (manual, uma vez só)

> O CI/CD não consegue fazer o primeiro provisionamento (precisa criar `.env`, instalar systemd/PM2, etc). Esses passos manuais vão antes do primeiro `git push`.

### 1. SSH no servidor

```bash
ssh root@82.25.79.245
```

### 2. Clonar o repo

```bash
cd /home/fjallstoppur
git clone https://github.com/davccavalcante/mimoskorea-shop.git
cd mimoskorea-shop
```

### 3. Criar `.env` no servidor

`.env` é **gitignored** — precisa ser criado manualmente. Cole o conteúdo do `.env` do dev local (com URLs de prod nos REDIRECT) ou copie via `scp`:

```bash
# Do seu Mac local:
scp .env root@82.25.79.245:/home/fjallstoppur/mimoskorea-shop/.env
```

Variáveis mais importantes:
- `SHOPEE_REFRESH_TOKEN`, `SHOPEE_ACCESS_TOKEN`, `SHOPEE_ACCESS_TOKEN_EXPIRES_AT` — bootstrap inicial (capturados via `shopee-explore`)
- `MELI_REFRESH_TOKEN` — bootstrap ML
- `CRON_SECRET` — algo aleatório (≥32 chars)
- `SHOPEE_REDIRECT_URL=https://mimoskorea.com.br/shop/api/shopee/oauth/callback`
- `MELI_REDIRECT_URL=https://mimoskorea.com.br/shop/api/mercadolivre/oauth/callback`

### 4. Diretório de tokens persistentes

```bash
mkdir -p /var/lib/mimoskorea-shop
chown root:root /var/lib/mimoskorea-shop
chmod 700 /var/lib/mimoskorea-shop
```

E no `.env` do projeto:
```
TOKENS_FILE=/var/lib/mimoskorea-shop/tokens.json
```

### 5. Build inicial

```bash
cd /home/fjallstoppur/mimoskorea-shop
npm ci --no-audit --no-fund
export NEXT_PUBLIC_BASE_PATH=/shop
npm run build
```

### 6. Iniciar via PM2

```bash
pm2 start npm --name mimoskorea-shop -- start
pm2 save
pm2 startup            # configura auto-start em reboot, se ainda não rodou
```

Verificar:
```bash
pm2 status
pm2 logs mimoskorea-shop --lines 30
curl -I http://localhost:3002/shop/
```

### 7. Atualizar Nginx

```bash
cp /home/fjallstoppur/mimoskorea-shop/deploy/nginx.conf \
   /etc/nginx/sites-available/mimoskorea.com.br
nginx -t                # valida sintaxe
systemctl reload nginx
```

### 8. Smoke test público

```bash
curl -I https://mimoskorea.com.br/shop/
```

Esperado: `HTTP/2 200`.

---

## GitHub Actions — secrets a configurar

No repo `mimoskorea-shop` em **Settings → Secrets and variables → Actions**, criar:

| Secret | Valor |
| --- | --- |
| `SSH_HOST` | `82.25.79.245` (ou hostname) |
| `SSH_USER` | `root` |
| `SSH_PORT` | (opcional, default 22) |
| `SERVER_SSH_KEY` | chave privada SSH (formato OpenSSH) — gere par dedicado, **não use sua chave pessoal** |
| `GIT_USER_NAME` | seu usuário GitHub (`davccavalcante`) |
| `GIT_TOKEN` | Personal Access Token com escopo `repo` |

Gerar a chave dedicada:

```bash
# Local
ssh-keygen -t ed25519 -C "github-deploy@mimoskorea-shop" -f ~/.ssh/mkd-deploy
# Mandar a pública pro servidor (uma vez)
ssh-copy-id -i ~/.ssh/mkd-deploy.pub root@82.25.79.245
# Copiar o conteúdo de ~/.ssh/mkd-deploy (a privada) pro secret SERVER_SSH_KEY
cat ~/.ssh/mkd-deploy
```

Gerar PAT do GitHub: https://github.com/settings/personal-access-tokens/new → scope `repo` (read+write).

---

## Deploys subsequentes (automático)

`git push origin main` dispara o workflow:

1. **`ci`** — `npm ci`, `type-check`, `biome` em runner ubuntu. ~1-2 min.
2. **`deploy`** — SSH no servidor, `git reset --hard origin/main`, `npm ci`, `NEXT_PUBLIC_BASE_PATH=/shop npm run build`, `pm2 restart`. ~3-5 min.
3. **`health-check`** — `curl https://mimoskorea.com.br/shop/` da própria runner. ~10s.

Se qualquer etapa falhar, o pipeline para. Se o `pm2 restart` falhou, o serviço antigo continua online (PM2 não substitui em caso de erro durante o restart).

---

## Refresh manual de OAuth Shopee (quando tokens expiram)

Quando o `tokens.json` em `/var/lib/mimoskorea-shop/` ficar inválido:

1. Localmente: `cd shopee-explore && npm run auth:url`
2. Abra a URL, autorize na conta do shop, copie a URL de callback
3. `npm run auth:exchange -- '<URL>'`
4. Copie o `tokens.json` resultante:
   ```bash
   scp shopee-explore/tokens.json root@82.25.79.245:/var/lib/mimoskorea-shop/tokens.json
   ```
5. `pm2 restart mimoskorea-shop` no servidor.

---

## Cron sync (pendente)

Os endpoints `/api/cron/sync-shopee` e `/api/cron/sync-meli` existem mas **não são chamados automaticamente em prod ainda**. Pra automatizar (escolha um):

**Opção A — cron do OS:**
```bash
# /etc/cron.d/mimoskorea-shop-sync
*/30 * * * * root curl -fsS -H "x-cron-secret: $(grep CRON_SECRET /home/fjallstoppur/mimoskorea-shop/.env | cut -d= -f2- | tr -d '"')" http://localhost:3002/shop/api/cron/sync-shopee >/dev/null
*/30 * * * * root curl -fsS -H "x-cron-secret: $(grep CRON_SECRET /home/fjallstoppur/mimoskorea-shop/.env | cut -d= -f2- | tr -d '"')" http://localhost:3002/shop/api/cron/sync-meli >/dev/null
```

**Opção B — systemd timer** (mais robusto, mais setup).

**Opção C — `node-cron` dentro do app** (não recomendo — acopla cron ao processo, escala mal).

---

## Troubleshooting

### `502 Bad Gateway` no `/shop/`
- `pm2 status mimoskorea-shop` (deve estar `online`)
- `pm2 logs mimoskorea-shop --lines 100`
- Confere a porta: `ss -tlnp | grep 3002`

### Assets `/shop/_next/...` retornam 404
- Build não rodou com `NEXT_PUBLIC_BASE_PATH=/shop`
- Refazer:
  ```bash
  cd /home/fjallstoppur/mimoskorea-shop
  export NEXT_PUBLIC_BASE_PATH=/shop
  npm run build
  pm2 restart mimoskorea-shop
  ```

### Catálogo sem produtos / só snapshot
- `tokens.json` inválido — ver "Refresh manual"

### Permission denied no deploy via Actions
- Confere se a chave pública foi adicionada em `~/.ssh/authorized_keys` do root no servidor
- Confere se o secret `SERVER_SSH_KEY` no GitHub é a chave PRIVADA correspondente

### `pm2` não encontrado
- PM2 não está instalado: `npm install -g pm2`
- Salvar lista de processos: `pm2 save && pm2 startup` (gerar comando de auto-start)
