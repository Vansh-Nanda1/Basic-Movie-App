const { Router } = require("express");
const {
  createMovie,
  deleteMovie,
  listMovies,
  updateMovie,
} = require("../controllers/movie.controllers");
const { authenticate } = require("../middlewares/auth.middleware");
const router = Router();

router.post("/", authenticate, createMovie);
router.get("/", authenticate, listMovies);
router.patch("/update/:id", authenticate, updateMovie);
router.delete("/delete/:id", authenticate, deleteMovie);
router.post("/bulk-upload", authenticate, bulk);
module.exports = router;
