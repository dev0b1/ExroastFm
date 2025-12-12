// Central config helpers for runtime flags
export const PREMADE_ONLY: boolean = ((): boolean => {
  // For MVP we want premade-only by default. Only opt-out when explicitly set to '0'.
  const v = process.env.PREMADE_ONLY;
  if (typeof v === 'string') return v !== '0';
  return true;
})();

export default {
  PREMADE_ONLY,
};
