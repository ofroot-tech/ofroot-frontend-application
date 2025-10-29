/*
Literate (Knuth-style) presentation of `useLiquidOpen`.

This module is a minimal, documented facade over an internal implementation.
Its responsibilities are intentionally small:

    1. Re-export the options type so consumers can import the type directly
         from this module.
    2. Re-export the internal implementation for advanced usage or testing.
    3. Provide a tiny public hook `useLiquidOpen` that forwards its arguments
         to the internal implementation. The public hook accepts an optional
         `mode` field limited to 'open' | 'close'.

Keeping the public surface minimal makes the hook easy to read,
test, and refactor.
*/

/* Re-export the shared options type so callers can import it from here. */
export type { LiquidOpenOptions } from './physics';

/* Import and re-export the internal implementation so it remains accessible. */
import { useLiquidOpenImpl } from './useLiquidOpenImpl';
export { useLiquidOpenImpl };

/* Public hook: facade over the internal implementation (no JSX here).
     It mirrors the internal signature but narrows the optional mode field
     to 'open' | 'close' for clearer public API semantics.
*/
export function useLiquidOpen(
    enabled: boolean,
    options?: import('./physics').LiquidOpenOptions & { mode?: 'open' | 'close' }
) {
    return useLiquidOpenImpl(enabled, options);
}
