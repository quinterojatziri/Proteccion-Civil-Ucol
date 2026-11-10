'use strict';

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const clean = (value, max = 255) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const isEmail = (value) =>
  typeof value === 'string' && value.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const toInt = (value) => {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) ? n : null;
};

const bad = (message) => {
  throw new HttpError(400, message);
};

const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

module.exports = { HttpError, asyncHandler, clean, isEmail, toInt, bad, ok };
