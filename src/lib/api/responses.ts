export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export function success<T>(data: T, init?: ResponseInit) {
  return Response.json({ success: true, data } satisfies ApiSuccess<T>, init);
}

export function failure(code: string, message: string, status = 400) {
  return Response.json(
    {
      success: false,
      error: {
        code,
        message
      }
    } satisfies ApiError,
    { status }
  );
}
