export class SunoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class SunoInvalidInputError extends SunoError {
  constructor(public readonly input: string) {
    super(`Not a recognizable Suno URL, UUID, or handle: ${input}`);
  }
}

export class SunoNotFoundError extends SunoError {
  constructor(public readonly uuid: string) {
    super(`Song not found: ${uuid}`);
  }
}

export class SunoHandleNotFoundError extends SunoError {
  constructor(public readonly handle: string) {
    super(`Handle not found: @${handle}`);
  }
}

/**
 * The Suno API rejected the request itself as malformed — an HTTP 422
 * "Unprocessable Entity", typically a missing/invalid query parameter (e.g.
 * `clips_sort_by` / `playlists_sort_by` on `/api/profiles`). This is distinct
 * from {@link SunoHandleNotFoundError} (a 404, meaning the handle does not
 * exist): a 422 says "we couldn't parse your request", not "no such user".
 */
export class SunoInvalidRequestError extends SunoError {
  constructor(
    public readonly endpoint: string,
    public readonly status: number,
  ) {
    super(`Suno rejected the request as malformed (HTTP ${status}): ${endpoint}`);
  }
}

export class SunoPrivateError extends SunoError {
  constructor(public readonly uuid: string) {
    super(`Song is private or unlisted: ${uuid}`);
  }
}

export class SunoNotReadyError extends SunoError {
  constructor(
    public readonly uuid: string,
    public readonly status: string,
  ) {
    super(`Song is not ready (status=${status}): ${uuid}`);
  }
}

export class SunoSchemaError extends SunoError {
  constructor(
    public readonly endpoint: string,
    public readonly issues: unknown,
    public readonly rawBody?: unknown,
  ) {
    super(`Suno API response failed schema validation at ${endpoint}`);
  }
}

export class SunoNetworkError extends SunoError {
  public readonly endpoint: string;
  public override readonly cause: unknown;
  constructor(endpoint: string, cause: unknown) {
    super(`Network error calling ${endpoint}: ${String(cause)}`);
    this.endpoint = endpoint;
    this.cause = cause;
  }
}
