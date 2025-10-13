// app/lib/response.ts
// Utilities to normalize API responses and errors from Next API routes.

import { NextResponse } from 'next/server';

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, { status: 201, ...init });
}

export function fail(message: string, status = 400, init?: ResponseInit, extras?: Partial<ApiFailure['error']>) {
  return NextResponse.json<ApiFailure>({ ok: false, error: { message, ...extras } }, { status, ...init });
}

export function fromError(err: any, fallbackMessage = 'Request failed') {
  const status = err?.status ?? err?.response?.status ?? 500;
  const message = err?.body?.message || err?.response?.data?.message || err?.message || fallbackMessage;
  return fail(message, status);
}
