export const log = (req, res, next) => {
  console.log(`${req.method} - ${req.path}`);
}

export const globalErr = (err, _req, res, _next) => {
  res.status(err.status || 500).json({ msg: `❌ Error - ${err.message}` });
}