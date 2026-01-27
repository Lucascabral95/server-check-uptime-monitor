export const colorByPercentage = (numberPercentage: number) => {
  if (numberPercentage >= 50) {
    return "#58e06d";
  } else {
    return "#ff5f5f";
  }
}