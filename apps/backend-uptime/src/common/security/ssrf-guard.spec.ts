import * as dns from 'dns';
import { assertSafeMonitorUrl, UnsafeUrlError } from './ssrf-guard';

jest.mock('dns', () => ({
  promises: {
    lookup: jest.fn(),
  },
}));

const lookupMock = dns.promises.lookup as jest.Mock;

describe('assertSafeMonitorUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows a hostname that resolves to a public IP', async () => {
    lookupMock.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
    await expect(assertSafeMonitorUrl('https://example.com/health')).resolves.toBeUndefined();
  });

  it('rejects a hostname that resolves to a private IP (DNS rebinding case)', async () => {
    lookupMock.mockResolvedValue([{ address: '10.0.0.5', family: 4 }]);
    await expect(assertSafeMonitorUrl('https://rebinding-attacker.test/')).rejects.toThrow(
      UnsafeUrlError,
    );
  });

  it('rejects when the hostname fails to resolve', async () => {
    lookupMock.mockRejectedValue(new Error('ENOTFOUND'));
    await expect(assertSafeMonitorUrl('https://does-not-exist.test/')).rejects.toThrow(
      UnsafeUrlError,
    );
  });

  it('rejects a non-http(s) scheme', async () => {
    await expect(assertSafeMonitorUrl('file:///etc/passwd')).rejects.toThrow(UnsafeUrlError);
    await expect(assertSafeMonitorUrl('ftp://example.com')).rejects.toThrow(UnsafeUrlError);
  });

  it('rejects an invalid URL', async () => {
    await expect(assertSafeMonitorUrl('not a url')).rejects.toThrow(UnsafeUrlError);
  });

  it('rejects loopback IPv4 literal (127.0.0.1)', async () => {
    await expect(assertSafeMonitorUrl('http://127.0.0.1:5432')).rejects.toThrow(UnsafeUrlError);
  });

  it('rejects localhost (resolves to loopback)', async () => {
    await expect(assertSafeMonitorUrl('http://localhost:5432')).rejects.toThrow(UnsafeUrlError);
  });

  it('rejects the cloud metadata link-local IP (169.254.169.254)', async () => {
    await expect(assertSafeMonitorUrl('http://169.254.169.254/latest/meta-data/')).rejects.toThrow(
      UnsafeUrlError,
    );
  });

  it('rejects RFC1918 private ranges (10/8, 172.16/12, 192.168/16)', async () => {
    await expect(assertSafeMonitorUrl('http://10.0.0.5')).rejects.toThrow(UnsafeUrlError);
    await expect(assertSafeMonitorUrl('http://172.16.0.1')).rejects.toThrow(UnsafeUrlError);
    await expect(assertSafeMonitorUrl('http://192.168.1.1')).rejects.toThrow(UnsafeUrlError);
  });

  it('rejects IPv6 loopback (::1)', async () => {
    await expect(assertSafeMonitorUrl('http://[::1]:5432')).rejects.toThrow(UnsafeUrlError);
  });

  it('rejects IPv6 unique-local (fc00::/7)', async () => {
    await expect(assertSafeMonitorUrl('http://[fd00::1]')).rejects.toThrow(UnsafeUrlError);
  });

  it('rejects IPv6 link-local (fe80::/10)', async () => {
    await expect(assertSafeMonitorUrl('http://[fe80::1]')).rejects.toThrow(UnsafeUrlError);
  });

  it('rejects an IPv4-mapped IPv6 address pointing at a private IP (::ffff:169.254.169.254)', async () => {
    // Este es el bypass clásico: la forma IPv6 "envuelve" una IPv4 privada.
    // ipaddr.process() debe desenvolverla y bloquearla igual.
    await expect(
      assertSafeMonitorUrl('http://[::ffff:169.254.169.254]'),
    ).rejects.toThrow(UnsafeUrlError);
  });

  it('allows a public IPv4 literal', async () => {
    await expect(assertSafeMonitorUrl('http://93.184.216.34')).resolves.toBeUndefined();
  });
});
