require("dotenv").config();
require("./config/database").connect();
const express = require("express");

const usersRoutes = require("./routes/users");
const reportsRoutes = require("./routes/reports");
const categoriesRoutes = require("./routes/categories");
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require("express-rate-limit");
const xss = require('xss-clean');

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});


//security
app.use(express.json({ limit: "50mb" }));

app.use(xss());

app.use(mongoSanitize());

//  apply to all requests
app.use(limiter);


//functionality
app.use("/users", usersRoutes);

app.use("/reports",reportsRoutes);

app.use("/categories",categoriesRoutes);


//Ping route to check status of server
app.get("/ping", (req, res) => {
    return res.send({
      error: false,
      message: "Server is healthy",
    });
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
    res.status(404).json({
      success: "false",
      message: "Page not found",
      error: {
        statusCode: 404,
        message: "You reached a route that is not defined on this server",
      },
    });
});

module.exports = app;