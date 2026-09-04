/**
 * Utility to extract standardized AI error messages for UI display.
 * Maps backend 429 and 503 error responses to exact required user copy.
 */
export function getAiErrorMessage(err) {
  const status = err?.response?.status;
  const backendMsg = err?.response?.data?.message || err?.message || '';

  // If backend provided a specific actionable message, display it
  if (backendMsg && typeof backendMsg === 'string') {
    const lower = backendMsg.toLowerCase();
    if (lower.includes('model is unavailable') || lower.includes('not found') || lower.includes('model')) {
      return backendMsg;
    }
    if (lower.includes('authentication failed') || lower.includes('unauthorized') || lower.includes('api key')) {
      return backendMsg;
    }
    if (lower.includes('rate limit') && lower.includes('seconds')) {
      return backendMsg;
    }
  }

  if (status === 429 || (backendMsg && backendMsg.toLowerCase().includes('quota'))) {
    return "AI usage is temporarily unavailable";
  }

  if (status === 503 || (backendMsg && backendMsg.toLowerCase().includes('service'))) {
    return "AI Service Temporarily Unavailable — Please try again in a few moments.";
  }

  if (backendMsg && typeof backendMsg === 'string' && backendMsg.length > 5 && !backendMsg.includes('Network Error')) {
    return backendMsg;
  }

  return "AI Service Temporarily Unavailable — Please try again in a few moments.";
}
