import { describe, it, expect } from 'vitest';
import { resolveSafeBaseUrl } from '@/lib/utils/url';

describe('Safe Base URL Resolver', () => {
  it('correctly resolves Cloudflare Workers staging domain from request headers', () => {
    const url = resolveSafeBaseUrl({
      host: 'bahibar-staging.bahibar.workers.dev',
      proto: 'https',
    });
    expect(url).toBe('https://bahibar-staging.bahibar.workers.dev');
  });

  it('correctly resolves production domain from request headers', () => {
    const url = resolveSafeBaseUrl({
      host: 'bahibar.com',
      proto: 'https',
    });
    expect(url).toBe('https://bahibar.com');
  });

  it('correctly resolves localhost and preserves local port for development', () => {
    const url = resolveSafeBaseUrl({
      host: 'localhost:3000',
      proto: 'http',
    });
    expect(url).toBe('http://localhost:3000');

    const urlCustomPort = resolveSafeBaseUrl({
      host: '127.0.0.1:8787',
      proto: 'http',
    });
    expect(urlCustomPort).toBe('http://127.0.0.1:8787');
  });

  it('rejects arbitrary untrusted attacker hosts and falls back to configured site URL', () => {
    const urlWithFallback = resolveSafeBaseUrl({
      host: 'attacker-phishing.com',
      proto: 'https',
      siteUrlEnv: 'https://bahibar-staging.bahibar.workers.dev',
    });
    expect(urlWithFallback).toBe('https://bahibar-staging.bahibar.workers.dev');

    const urlDefault = resolveSafeBaseUrl({
      host: 'malicious-domain.xyz',
      proto: 'https',
    });
    expect(urlDefault).toBe('http://localhost:3000');
  });

  it('falls back to environment variable when headers are unavailable', () => {
    const url = resolveSafeBaseUrl({
      siteUrlEnv: 'https://bahibar-staging.bahibar.workers.dev/',
    });
    expect(url).toBe('https://bahibar-staging.bahibar.workers.dev');
  });

  it('sanitizes trailing slashes properly', () => {
    const url = resolveSafeBaseUrl({
      host: 'bahibar-staging.bahibar.workers.dev',
      proto: 'https',
      siteUrlEnv: 'https://bahibar-staging.bahibar.workers.dev///',
    });
    expect(url).toBe('https://bahibar-staging.bahibar.workers.dev');
  });
});
