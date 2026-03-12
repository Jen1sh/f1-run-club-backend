export const formatErrorResponse = (
  errors: Record<string, string>,
  error: string,
  statusCode: number,
) => {
  return {
    errors,
    error,
    statusCode,
  };
};
