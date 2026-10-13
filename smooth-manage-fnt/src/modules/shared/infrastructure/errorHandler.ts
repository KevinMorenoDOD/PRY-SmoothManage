import type { AxiosError } from "axios";
import type { ApiError } from "../domain/ApiError";

export function parseApiError(error: unknown): ApiError {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response?.data) {
      return axiosError.response.data;
    }
  }

  return {
    timestamp: new Date().toISOString(),
    message: "An unexpected error occurred",
    details: error instanceof Error ? error.message : String(error),
  };
}