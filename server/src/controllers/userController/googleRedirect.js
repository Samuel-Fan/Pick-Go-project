module.exports = async (req, res, next) => {
  try {
    res.redirect(process.env.REDIRECT_URI + "/googleLogin");
  } catch (e) {
    next(e);
  }
};
