export const maskCreditNumber = (creditNumber: string): string | null => {
    if (!creditNumber || creditNumber.length < 4) return null;
    return '****' + creditNumber.slice(-4);
  };
  