export function entropy(probabilities: number[]): number {
  return -probabilities.reduce((sum, p) => {
    if (p <= 0) return sum;
    return sum + p * Math.log(p);
  }, 0);
}

export function normalizedEntropy(probabilities: number[]): number {
  if (probabilities.length <= 1) return 0;
  return entropy(probabilities) / Math.log(probabilities.length);
}
