export const formatDate = (date: string | undefined): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};