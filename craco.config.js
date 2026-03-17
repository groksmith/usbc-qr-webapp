// Override CRA's PostCSS config to use postcss.config.js instead of the
// hardcoded plugin list (which doesn't support Tailwind CSS v4).
module.exports = {
  style: {
    postcss: {
      mode: "file",
    },
  },
};
