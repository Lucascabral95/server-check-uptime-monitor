export const formatTimeRemaining = (seconds: number): string => {
  if (seconds <= 0) return "Ahora";
  
  const minutes = Math.ceil(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `~${hours}h ${mins}m`;
  } else {
    return `~${minutes}m`;
  }
};