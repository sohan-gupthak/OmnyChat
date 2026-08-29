import { Middleware, UnknownAction } from '@reduxjs/toolkit';
import { login, register } from '../store/slices/authSlice';
import { ensureLocalKeysBootstrapped } from '../store/slices/keysSlice';

/**
 * Triggers the idempotent key bootstrap thunk on login or register.
 * The thunk short-circuits if a local key pair already exists, so this
 * never causes a network storm.
 */
export const keyInitializerMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  if (login.fulfilled.match(action) || register.fulfilled.match(action)) {
    setTimeout(() => {
      void store.dispatch(ensureLocalKeysBootstrapped() as unknown as UnknownAction);
    }, 250);
  }
  return result;
};
