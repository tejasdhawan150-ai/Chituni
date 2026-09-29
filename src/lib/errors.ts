/** An error whose message is safe to show to the end user. */
export class UserFacingError extends Error {}

/**
 * "Not found" message. In demo mode, data lives only in one server instance's
 * memory (serverless hosts run many short-lived instances), so explain that
 * instead of implying the user did something wrong.
 */
export function notFoundMessage(thing: string, demo: boolean): string {
  return demo
    ? `This ${thing} is no longer available — demo mode keeps data only temporarily. Please start again (connect a database for permanent storage).`
    : `${thing.charAt(0).toUpperCase()}${thing.slice(1)} not found.`;
}
