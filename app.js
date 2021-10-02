require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./model/user");
const Report = require("./model/report");
const auth = require("./middleware/auth");
const { uploadMiddleware, productsPhotoFolder } = require('./middleware/upload');

const app = express();

app.use(express.json({ limit: "50mb" }));

//RUTAS (cambiar a router y exportar cada una de la carpeta routes)

app.post("/register/", async (req, res) => {
  try {
    // Get user input
    const { username,  password , email, name } = req.body;

    // Validate user input
    if (!(email && password && username && name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      username,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      name
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login/", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }
    else{
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }
});

//routes de accion
app.post("/newreport/", auth, async (req, res) => {
  try {
    // Get user input
    const { username , title, description, images, category } = req.body;

    // Validate user input
    if (!(username && title && description && category)) {
      res.status(400).send("All input is required");
    }

    // Create user in our database
    const report = await Report.create({
      username,
      title,
      description,
      images:images,
      category:category
    });

    // return new report
    res.status(201).json(report);
  } catch (err) {
    console.log(err);
  }
});

app.get('/reports/', auth, async (req, res) => {
  try {
      let reports = await Report.find();
      console.log('All reports were requested');
      res.json(reports);
  } catch (err) {
      res.status(503).end(`Request for all reports caused an error`);
      console.log(err.message);
  }
});


app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
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