import { useSyncExternalStore } from 'react';

/**
 * Out-of-Redux store for AES-GCM shared keys.
 *
 * Redux Toolkit's default `serializableCheck` middleware rejects `CryptoKey`
 * instances in actions/state (and Immer cloning fails on them). Shared keys
 * therefore live in this module-level Map. Components subscribe via
 * `useSharedKey(contactId)` which uses `useSyncExternalStore` so reads stay
 * reactive without putting non-serializable values into Redux.
 *
 * The lifetime is "per session + page reload" — derived keys are re-built on
 * demand from the persisted ECDH key pair in `keysSlice` / localStorage, so
 * dropping them here on reload is safe.
 */

const sharedKeys = new Map<number, CryptoKey>();
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

export function setSharedKey(contactId: number, key: CryptoKey): void {
  const existing = sharedKeys.get(contactId);
  if (existing === key) return;
  sharedKeys.set(contactId, key);
  emit();
}

export function clearSharedKey(contactId: number): void {
  if (!sharedKeys.has(contactId)) return;
  sharedKeys.delete(contactId);
  emit();
}

export function getSharedKey(contactId: number): CryptoKey | null {
  return sharedKeys.get(contactId) ?? null;
}

export function clearAllSharedKeys(): void {
  if (sharedKeys.size === 0) return;
  sharedKeys.clear();
  emit();
}

/**
 * React hook returning the current shared key for `contactId`, re-rendering
 * subscribers when the map changes. Returns `null` while uninitialized.
 */
export function useSharedKey(contactId: number | null | undefined): CryptoKey | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => (contactId == null ? null : sharedKeys.get(contactId) ?? null),
    () => null
  );
}
