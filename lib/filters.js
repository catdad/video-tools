function size(opts) {
  const def = -2;
  const width = opts.width ? `min(${opts.width}\\,iw)` : def;
  const height = opts.height ? `min(${opts.height}\\,ih)` : def;

  if (width === def && height === def) {
    return '';
  }

  return `-vf "scale=${width}:${height}"`;
}

module.exports = { size };
