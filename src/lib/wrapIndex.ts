/** Moves `index` by `step` within a list of `length`, wrapping around at both
 * ends (last → first, first → last). Returns -1 for an empty list. */
export function wrapIndex(index: number, step: number, length: number): number {
  if (length <= 0) return -1;
  return (((index + step) % length) + length) % length;
}
