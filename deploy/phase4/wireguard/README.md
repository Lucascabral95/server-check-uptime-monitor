# WireGuard topology

Use a private WireGuard interface between the control-plane VPS (`10.44.0.1/24`) and the probe VPS (`10.44.0.2/24`). Allow only HTTPS from the probe to the control plane and deny public access to PostgreSQL, Redis and BullMQ ports.

Generate keys on each host, keep them outside Git, and replace the placeholders below. Firewall rules should allow UDP 51820 only between the two public peer addresses.

```ini
# control-plane /etc/wireguard/wg0.conf
[Interface]
Address = 10.44.0.1/24
ListenPort = 51820
PrivateKey = <control-plane-private-key>

[Peer]
PublicKey = <probe-public-key>
AllowedIPs = 10.44.0.2/32
```

```ini
# probe /etc/wireguard/wg0.conf
[Interface]
Address = 10.44.0.2/24
PrivateKey = <probe-private-key>

[Peer]
PublicKey = <control-plane-public-key>
Endpoint = <control-plane-public-ip>:51820
AllowedIPs = 10.44.0.1/32
PersistentKeepalive = 25
```
