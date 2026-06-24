export function ok(res, data) {
  res.json({ code: 0, message: 'ok', data });
}

export function fail(res, message, status = 400) {
  res.status(status).json({ code: status, message, data: null });
}
