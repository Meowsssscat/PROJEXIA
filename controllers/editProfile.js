const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  const userId = req.session.userId; // or however you store session user
  const { fullName, program, year } = req.body;

  try {
    const user = await User.findById(userId);

    // 🚫 Check if user already edited within 30 days
    if (user.lastProfileEdit) {
      const now = new Date();
      const nextAllowedEdit = new Date(user.lastProfileEdit);
      nextAllowedEdit.setMonth(nextAllowedEdit.getMonth() + 1);

      if (now < nextAllowedEdit) {
        return res.redirect('/profile')
      }
    }

    // ✔ Update user info
    user.fullName = fullName;
    user.program = program;
    user.year = year;
    user.lastProfileEdit = new Date();

    await user.save();

    return res.redirect('/profile');

  } catch (err) {
    console.error(err);
    res.send({
      success: false,
      message: "Something went wrong."
    });
  }
};
