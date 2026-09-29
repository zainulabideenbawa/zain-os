import { describe, it, expect } from 'vitest';
import { urlBase64ToUint8Array } from '@/lib/push';

describe('Milestone 3: PWA & Push Helpers', () => {
  it('converts base64 VAPID public key into Uint8Array properly', () => {
    // Standard mock base64url string
    const mockVapid = 'BNc_9G9L7bQzX8x0mX-Kk6dY';
    const uintArray = urlBase64ToUint8Array(mockVapid);
    expect(uintArray).toBeInstanceOf(Uint8Array);
    expect(uintArray.length).toBeGreaterThan(0);
  });

  it('verifies manifest metadata configuration values', async () => {
    const manifestModule = await import('@/app/manifest');
    const manifest = manifestModule.default();

    expect(manifest.name).toBe('Zain OS');
    expect(manifest.short_name).toBe('Zain OS');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/today');
    expect(manifest.background_color).toBe('#0B0E14');
    expect(manifest.theme_color).toBe('#0B0E14');
    expect(manifest.icons?.length).toBe(2);
  });
});
