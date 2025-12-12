// Backwards-compatible config for modules importing from the repository root `lib/`.
// Mirrors `src/lib/config.ts` so both `lib/*` and `src/lib/*` imports resolve.
export const PREMADE_ONLY: boolean = ((): boolean => {
  const v = process.env.PREMADE_ONLY;
  if (typeof v === 'string') return v !== '0';
  return true;
})();

export default {
  PREMADE_ONLY,
};
