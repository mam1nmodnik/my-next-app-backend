export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
  }
}