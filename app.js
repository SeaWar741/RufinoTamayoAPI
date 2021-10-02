require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const path = require('path');

const User = require("./model/user");
const Report = require("./model/report");
const Category = require("./model/category");
const auth = require("./middleware/auth");
const { uploadMiddleware, reportsPhotoFolder } = require('./middleware/upload');

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
app.post("/reports/new", auth, uploadMiddleware.array('photo',10), async (req, res) => {
  try {
    const imagesData = req.files

    const names = imagesData.map(({ filename }) => filename);

    const { username , title, description, images, category } = JSON.parse(req.body.report);

    // Validate user input
    if (!(username && title && description && category)) {
      res.status(400).send("All input is required");
    }

    // Create user in our database
    const report = await Report.create({
      username,
      title,
      description,
      images:names,
      category:category
    });
    // return new report
    res.status(201).json(report);
  } catch (err) {
    console.log(err);
  }
});

app.delete('/reports/:id', auth, async (req, res) => {

  // Get user input
  const id  = req.params.id;

  try {
      let report = await Report.findOneAndDelete({ _id: id });
      
      if (report.images) {
        report.images.forEach((element) => {
          //console.log(element)
          deletePhoto(element);
        });
        res.json(report)
      }
      else {
          //console.log(`Sending report info for ${report}`);
          res.json(report);
      }
  } catch (err) {
      res.status(503).end(`Request for deleting productId ${id} caused an error`);
      console.log(err.message);
  }
});

app.put('/reports/:id', auth, uploadMiddleware.array('photo',10), async (req, res) => {

  // Get user input
  const imagesData = req.files
  const id  = req.params.id;

  try {

      let report = await Report.findOne({ _id: id });
      
      const names = imagesData.map(({ filename }) => filename);

      const { username , title, description, category, attentionDate } = JSON.parse(req.body.report);


      if(username == report.username){

        if (!report) {
          names.forEach((element) => {
            deletePhoto(element);
          });

          res.status(404).end(`Report with id ${id} does not exist in this dojo`);
        }
        else {
          
          if(username && attentionDate && !title && !description && !category && (names === undefined || names.length == 0)){
            report.attentionDate = attentionDate

            await report.save()
            res.json(report)
          }
          else{

            if(attentionDate != ""){
              report.attentionDate = attentionDate
            }
            report.title = title
            report.description = description
            report.category = category

            let previousImages = report.images
            
            if(req.files){
              report.images = names

              previousImages.forEach((element) => {
                //console.log(element)
                deletePhoto(element);
              });
            }

            await report.save()
            res.json(report)
          }
        }
      }
      else{
        names.forEach((element) => {
          deletePhoto(element);
        });
        res.status(400).send("Invalid Credentials");
      }
      
  } catch (err) {
      res.status(503).end(`Request for updating report ${id} caused an error`);
      console.log(err.message);
  }
});



app.post("/categories/new", auth, async (req, res) => {
  try {
    const {name, callToAction, campo } = req.body;

    // Validate user input
    if (!(name && callToAction && campo)) {
      res.status(400).send("All input is required");
    }

    // Create user in our database
    const category = await Category.create({
      name:name,
      callToAction:callToAction,  
      campo:campo,
    });
    // return new category
    res.status(201).json(category);
  } catch (err) {
    console.log(err);
  }
});

app.delete('/categories/:id', auth, async (req, res) => {

  // Get user input
  const id  = req.params.id;

  try {
      let category = await Category.findOneAndDelete({ _id: id });
      
      res.json(category);
  } catch (err) {
      res.status(503).end(`Request for deleting category ${id} caused an error`);
      console.log(err.message);
  }
});

app.put('/categories/:id', auth, async (req, res) => {

  // Get user input
  const id  = req.params.id;

  try {

      let category = await Category.findOne({ _id: id });
      


      const {name, callToAction, campo } = req.body;
      
      if (!category) {
        res.status(404).end(`Report with id ${id} does not exist in this dojo`);
      }
      else{
        category.name = name
        category.callToAction = callToAction
        category.campo = campo
      }

      await category.save()
      res.json(category)
      
  } catch (err) {
      res.status(503).end(`Request for updating category ${id} caused an error`);
      console.log(err.message);
  }
});


//routes para obtener
app.get('/reports/all', auth, async (req, res) => {
  try {
      let reports = await Report.find();
      //console.log('All reports were requested');
      res.json(reports);
  } catch (err) {
      res.status(503).end(`Request for all reports caused an error`);
      console.log(err.message);
  }
});

app.get('/reports/:id', auth, async (req, res) => {

  // Get user input
  const id  = req.params.id;

  try {
      let report = await Report.findOne({ _id: id });
      //console.log('All reports were requested');
      if (!report) {
        res.status(404).end(`report with id ${id} does not exist in this dojo`);
        //console.log(`report with id ${id} does not exist in this dojo`);
      }
      else {
          //console.log(`Sending report info for ${report}`);
          res.json(report);
      }
  } catch (err) {
      res.status(503).end(`Request for all reports caused an error`);
      //console.log(err.message);
  }
});

app.get('/reports/images/:photoPath', auth, (req, res) => {
  let photoPath = req.params.photoPath;
  let fullPath = path.join(__dirname + `/${reportsPhotoFolder}/` + photoPath)
  res.sendFile(fullPath);
});


app.get('/categories/all', auth, async (req, res) => {
  try {
      let categories = await Category.find();
      //console.log('All reports were requested');
      res.json(categories);
  } catch (err) {
      res.status(503).end(`Request for all categories caused an error`);
      console.log(err.message);
  }
});

app.get('/categories/:id', auth, async (req, res) => {

  // Get user input
  const id  = req.params.id;

  try {
      let category = await Category.findOne({ _id: id });
      if (!category) {
        res.status(404).end(`category with id ${id} does not exist in this dojo`);
        //console.log(`category with id ${id} does not exist in this dojo`);
      }
      else {
          //console.log(`Sending category info for ${category}`);
          res.json(category);
      }
  } catch (err) {
      res.status(503).end(`Request for all categories caused an error`);
      //console.log(err.message);
  }
});


//routes de pureba
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


//extras
function deletePhoto(photoPath) {
  let fullPath = path.join(__dirname + `/${reportsPhotoFolder}/` + photoPath)
  fs.unlink(fullPath, (err) => {
      if (err) {
          console.error(`Error when deleting photo from fs ${err.message}`)
      } else {
          console.log(`Photo ${photoPath} deleted successfully`);
      }
  })

}

module.exports = app;