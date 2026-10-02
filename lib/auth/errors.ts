export function errorName(error: unknown): string {
  return error instanceof Error ? error.name : "";
}

export function authErrorMessage(error: unknown): string {
  switch (errorName(error)) {
    case "NotAuthorizedException":
      return "Incorrect email or password, or your session has expired.";
    case "UsernameExistsException":
      return "An account with this email already exists at this school. Sign in or reset your password.";
    case "UserNotConfirmedException":
      return "Please verify your email before signing in.";
    case "CodeMismatchException":
      return "The verification code is incorrect.";
    case "ExpiredCodeException":
      return "The code has expired. Request a new code.";
    case "InvalidPasswordException":
      return "The password does not meet this school's password requirements.";
    case "LimitExceededException":
    case "TooManyRequestsException":
      return "Too many attempts. Please try again later.";
    case "AbortError":
      return "The operation was cancelled. Please try again.";
    default:
      return error instanceof Error
        ? error.message
        : "Unable to complete the request. Please try again.";
  }
}
