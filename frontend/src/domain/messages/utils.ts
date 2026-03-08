/**
 * DOMAIN - MESSAGES - UTILS
 * Message business logic utilities
 */

/**
 * Determine if messages should be grouped together
 * Messages are grouped when:
 * - Same user
 * - Less than 5 minutes apart
 */
export function shouldGroupMessages<T extends { userId: string; createdAt?: Date }>(
  currentMsg: T,
  previousMsg: T | undefined
): boolean {
  if (!previousMsg) {
    return false;
  }
  
  // Different user - don't group
  if (currentMsg.userId !== previousMsg.userId) {
    return false;
  }
  
  // Check time proximity (less than 5 minutes)
  if (currentMsg.createdAt && previousMsg.createdAt) {
    const diffInMs = new Date(currentMsg.createdAt).getTime() - new Date(previousMsg.createdAt).getTime();
    const diffInMinutes = diffInMs / (1000 * 60);
    return diffInMinutes < 5;
  }
  
  return true;
}

/**
 * Check if a date separator should be shown between messages
 */
export function shouldShowDateSeparator<T extends { createdAt?: Date }>(
  currentMsg: T,
  previousMsg: T | undefined,
  index: number
): boolean {
  // Always show at the start
  if (index === 0) {
    return true;
  }
  
  // Check if dates are different
  if (previousMsg?.createdAt && currentMsg.createdAt) {
    return new Date(previousMsg.createdAt).toDateString() !== 
           new Date(currentMsg.createdAt).toDateString();
  }
  
  return false;
}
