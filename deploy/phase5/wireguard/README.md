# WireGuard entre las dos VPS

La configuración canónica usa `10.44.0.1/24` para la VPS principal y `10.44.0.2/24` para la secundaria. Copiá `primary-wg0.conf.example` y `secondary-wg0.conf.example` a `/etc/wireguard/wg0.conf` en el host correspondiente y reemplazá únicamente los placeholders de claves e IP pública.

Generá las claves en los hosts, nunca en el repositorio:

```bash
sh ./scripts/generate-wireguard-keys.sh /etc/wireguard/server-check
sudo chmod 600 /etc/wireguard/server-check/*.key
```

La secundaria debe llegar a Caddy por el nombre público para conservar la validación TLS. Configurá DNS privado o, como mínimo, agregá en la VPS secundaria:

```text
10.44.0.1 status.example.com
```

Luego dejá `CONTROL_PLANE_URL=https://status.example.com` en `deploy/phase4/.env`. El nombre debe coincidir con `PUBLIC_DOMAIN` y con el certificado emitido por Caddy.

Activá el túnel en ambos hosts:

```bash
sudo systemctl enable --now wg-quick@wg0
sudo wg show
```

## Firewall mínimo

En la VPS principal permití SSH, TCP `80/443` y UDP `51820` solo desde la IP pública de la secundaria. En la secundaria no publiques puertos Docker; permití SSH y la salida HTTPS hacia `10.44.0.1` si aplicás una política de egress restrictiva.

Ejemplo con UFW en la principal:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from <secondary-public-ip> to any port 51820 proto udp
sudo ufw enable
```

Docker puede evitar reglas UFW para puertos publicados. Este despliegue solo publica Caddy en interfaces públicas; Grafana queda ligado a `127.0.0.1` y PostgreSQL, Redis, Prometheus, Loki y Tempo no tienen puertos publicados.
