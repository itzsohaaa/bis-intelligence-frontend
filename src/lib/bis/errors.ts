export const queryErrors = {
  INVALID_REQUEST: "Enter a question and a positive whole number for retrieval depth.",
  NOT_CONFIGURED: "Ask BIS is not configured on this server yet. A platform administrator needs to configure the BIS connection.",
  UPSTREAM_AUTH: "The BIS service could not authorize the server connection. Please contact the platform administrator.",
  UPSTREAM_VALIDATION: "The BIS service could not accept this request. Review your question and retrieval depth.",
  RATE_LIMITED: "The BIS service is handling too many requests. Please try again later.",
  UPSTREAM_ERROR: "The BIS service could not complete the request. Please try again later.",
  UNREACHABLE: "The BIS service could not be reached. Please try again.",
  TIMEOUT: "The BIS service took too long to respond. Please try again.",
  INVALID_RESPONSE: "The BIS service returned an unreadable response. Please try again.",
} as const;

export type QueryErrorCode = keyof typeof queryErrors;

export function errorMessage(code: unknown): string {
  return typeof code === "string" && Object.hasOwn(queryErrors, code)
    ? queryErrors[code as QueryErrorCode] : queryErrors.UPSTREAM_ERROR;
}
