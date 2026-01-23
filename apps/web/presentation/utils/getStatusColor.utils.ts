export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'UP':
      return "#10B981";
    case 'DOWN':
      return "#EF4444";
    case 'PENDING':
      return "#F59E0B";
    default:
      return "#72839E";
  }
};