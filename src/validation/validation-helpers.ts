export const REGEX_PATTERNS = {
  Email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  Password:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  CharacterWithoutSpaces: /^[^\s]+$/,
  CharacterWithSpaces: /^[^\s]+$/,
  Names: /^[^\s][a-zA-ZÀ-ÿ\u0100-\u017F\s'-]{2,50}$/,
};

type zodIss = {
  [x: string]: unknown;
  readonly input: unknown;
  readonly code: string;
  readonly expected?: string;
};

export const INPUT_REQUIRED_INVALID_ERROR_MESSAGE = {
  error: (iss: zodIss) =>
    iss.input ? "Invalid field value" : "This field is required",
};

export const INPUT_REQUIRED_INVALID_ERROR_MESSAGE_MIN_LENGTH = {
  error: (iss: zodIss) =>
    iss.input ? `Insufficient length` : `Insufficient length`,
};

export const INPUT_REQUIRED_INVALID_ERROR_MESSAGE_MAX_LENGTH = {
  error: (iss: zodIss) =>
    iss.input ? `Exceeded maximum length` : `Exceeded maximum length`,
};
