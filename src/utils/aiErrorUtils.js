/**
 * Utility to extract standardized AI error messages for UI display.
 * Maps backend 429 and 503 error responses to exact required user copy.
 */
export function getAiErrorMessage(err) {
  const status = err?.response?.status;
  const backendMsg = err?.response?.data?.message || err?.message || '';

  if (status === 429 || backendMsg.toLowerCase().includes('quota') || backendMsg.toLowerCase().includes('ai usage')) {
    return "AI usage is temporarily unavailable";
  }

  if (status === 503 || backendMsg.toLowerCase().includes('unavailable') || backendMsg.toLowerCase().includes('service')) {
    return "AI Service Temporarily Unavailable — Please try again in a few moments.";
  }

  if (backendMsg && typeof backendMsg === 'string' && backendMsg.length > 5 && !backendMsg.includes('Network Error')) {
    return backendMsg;
  }

  return "AI Service Temporarily Unavailable — Please try again in a few moments.";
}
