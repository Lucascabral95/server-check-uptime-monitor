import { isIP } from 'net';
import { promises as dns } from 'dns';
import ipaddr from 'ipaddr.js';

export class UnsafeUrlError extends Error {}

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

// Categorías de ipaddr.js (confirmadas leyendo su código fuente, no la doc):
// IPv4.SpecialRanges: unspecified, broadcast, multicast, linkLocal, loopback,
//   carrierGradeNat, private, reserved.
// IPv6.SpecialRanges: unspecified, linkLocal, multicast, loopback, uniqueLocal,
//   reserved, 6to4, teredo, rfc6145, rfc6052.
// Todo lo que no matchea ninguna de estas cae en 'unicast' (público). Se
// bloquea todo excepto 'unicast': esto es un allowlist, no una blocklist —
// si ipaddr.js agrega una categoría nueva en el futuro, queda bloqueada por
// default en vez de colarse.
const ALLOWED_RANGES = new Set(['unicast']);

function isBlockedIp(ip: string): boolean {
  try {
    // ipaddr.process() ya desenvuelve IPv4-mapped IPv6 (::ffff:a.b.c.d) a su
    // forma IPv4 antes de clasificar, así que ese bypass queda cubierto.
    const parsed = ipaddr.process(ip);
    return !ALLOWED_RANGES.has(parsed.range());
  } catch {
    // Si no se puede parsear, no se puede garantizar que sea seguro.
    return true;
  }
}

/**
 * Lanza UnsafeUrlError si la URL no es http(s), o si el hostname (o
 * cualquiera de las IPs a las que resuelve) cae en un rango privado,
 * loopback, link-local (incluye el metadata endpoint de cloud 169.254.169.254)
 * u otro rango reservado.
 *
 * Debe llamarse tanto al crear/actualizar un monitor (para rechazar la
 * entrada obvia) como inmediatamente antes de cada request real en
 * HttpPoolService (porque el DNS puede cambiar entre la validación de
 * entrada y el momento del check — DNS rebinding).
 */
export async function assertSafeMonitorUrl(rawUrl: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError('URL inválida');
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new UnsafeUrlError(`Esquema no permitido: ${url.protocol}`);
  }

  const hostname = url.hostname;

  if (isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new UnsafeUrlError('La URL apunta a una IP privada/reservada');
    }
    return;
  }

  let addresses: { address: string }[];
  try {
    addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new UnsafeUrlError('No se pudo resolver el hostname de la URL');
  }

  if (addresses.length === 0) {
    throw new UnsafeUrlError('El hostname de la URL no resolvió ninguna IP');
  }

  for (const { address } of addresses) {
    if (isBlockedIp(address)) {
      throw new UnsafeUrlError(
        `El hostname resuelve a una IP privada/reservada (${address})`,
      );
    }
  }
}
