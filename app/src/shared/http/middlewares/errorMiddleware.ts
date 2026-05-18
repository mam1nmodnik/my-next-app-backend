import { ErrorRequestHandler } from "express";
import { HttpError } from "../errors/error";

export const errorMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
) => {
  const error = err as HttpError;
  res.status(error.status || 500).json({
    message: error.message || "Server error",
  });
};