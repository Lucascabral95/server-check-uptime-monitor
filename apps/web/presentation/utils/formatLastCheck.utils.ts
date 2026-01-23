export const formatLastCheck = (date: string | Date | null): string => {
  if (!date) return "Sin verificar";
  
  const lastCheckDate = typeof date === 'string' ? new Date(date) : date;
  
  const hours = lastCheckDate.getHours().toString().padStart(2, '0');
  const minutes = lastCheckDate.getMinutes().toString().padStart(2, '0');
  const day = lastCheckDate.getDate().toString().padStart(2, '0');
  const month = (lastCheckDate.getMonth() + 1).toString().padStart(2, '0');
  const year = lastCheckDate.getFullYear();

  return `${hours}:${minutes} - ${day}/${month}/${year}`;
};