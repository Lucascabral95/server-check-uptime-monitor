export const colorByPercentage = (numberPercentage: number) => {
  if (numberPercentage >= 50) {
    return "var(--color-up)";
  } else {
    return "var(--color-down)";
  }
}