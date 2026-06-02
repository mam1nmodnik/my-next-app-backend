import { ErrorRequestHandler } from "express";
import { HttpError } from "../errors/error";

export const errorMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next,
) => {
  const error = err as HttpError;
  res.status(error.status || 500).json({
    message: error.message || "Server error",
  });
};
