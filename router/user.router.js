const { Router } = require("express");
const {
  loginUser,
  logoutUser,
  registerUser,
} = require("../controllers/usercontroller");

const router = Router();

router.post("/add", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

module.exports = router;
