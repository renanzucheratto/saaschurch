/**
 * Formats a full name to show only first and last name
 * @param fullName - The complete name to format
 * @returns The formatted name with only first and last name, or original name if single word
 */
export const formatFirstLastName = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') {
    return '';
  }

  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
  
  if (nameParts.length <= 1) {
    return nameParts[0] || '';
  }

  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  
  return `${firstName} ${lastName}`;
};
