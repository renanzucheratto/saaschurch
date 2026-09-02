export const getApiErrorMessage = (value: unknown, fallback: string): string => {
  if (typeof value === 'object' && value !== null && 'data' in value) {
    const data = (value as { data?: unknown }).data;
    if (typeof data === 'object' && data !== null && 'error' in data) {
      const errorValue = (data as { error?: unknown }).error;
      if (typeof errorValue === 'string') return errorValue;
    }
  }
  return fallback;
};
