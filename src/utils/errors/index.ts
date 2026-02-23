export function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  //   if it's an object, try to get the message from the error object
  if (typeof error === "object" && error !== null) {
    if ("message" in error) {
      return error.message as string;
    }
  }
  return String(error);
}
