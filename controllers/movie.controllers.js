const asyncHandler = require("express-async-handler");
const { ErrorHandler } = require("../utils/Errorhandler");
const xlsx = require("xlsx");
const fs = require("fs");
const movieModel = require("../models/movie.model");

function parsePagination(limit, page) {
  const parsedLimit = Math.max(parseInt(limit, 10) || 10, 1);
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (parsedPage - 1) * parsedLimit;
  return { parsedLimit, parsedPage, skip };
}

//! Create Movie (Admin only)
exports.createMovie = asyncHandler(async (req, res) => {
  await movieModel.create({...req.body, createdBy: req.foundUser._id});
  res.status(201).json({ success: true, message: "movie created succesfully" });
});

//! List Movies with filter + pagination
exports.listMovies = asyncHandler(async (req, res, next) => {
  let { genre, minRating, maxRating, page = 1, limit = 10 } = req.query;

  const { parsedLimit, parsedPage, skip } = parsePagination(limit, page);

  // Build filter object
  const filter = {};
  if (genre) filter.genre = genre;
  if (minRating || maxRating) {
    filter.rating = {};
    if (minRating) filter.rating.$gte = Number(minRating);
    if (maxRating) filter.rating.$lte = Number(maxRating);
  }

  const movies = await movieModel
    .find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .lean();

  if (!movies || movies.length === 0) {
    return next(new ErrorHandler("No Movies found", 404));
  }

  const total = await movieModel.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "All movies fetched successfully",
    data: movies,
    page: parsedPage,
    limit: parsedLimit,
    total,
  });
});

//! Update Movie
exports.updateMovie = asyncHandler(async (req, res, next) => {
  let id = req.params.id;
  let findMovie = await movieModel.findOne({
    _id: id,
  });

  if (!findMovie) {
    return next(new ErrorHandler("movie not found", 403));
  }

  let updateMovie = await movieModel.findByIdAndUpdate(
    { _id: id },
    {...req.body, createdBy: req.foundUser._id},
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: "movie updated successfully",
    data: updateMovie,
  });
});

//! delete movie
exports.deleteMovie = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  const movie = await movieModel.findOne({
    _id: id,
  });

  if (!movie) {
    return next(new ErrorHandler("Movie not found or not authorized to delete", 404));
  }
  const deletedMovie = await movieModel.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: "Movie deleted successfully",
    data: deletedMovie,
  });
});


//! Bulk Upload via Excel
exports.bulkUpload = asyncHandler(async (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    // Convert rows to Movie documents
    const movies = rows.map(row => ({
      name: row.name,
      rating: row.rating,
      genre: row.genre,
      watchedUsers: row.watchedUsers 
        ? row.watchedUsers.split(",").map(id => id.trim()) 
        : [],
      createdBy: req.foundUser._id, 
    }));

    const insertedMovies = await movieModel.insertMany(movies);

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Movies uploaded successfully",
      total: insertedMovies.length,
      data: insertedMovies,
    });

})