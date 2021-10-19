require("dotenv").config();
//require("../config/database").connect();
const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');

const User = require("../model/user");
const Report = require("../model/report");
const auth = require("../middleware/auth");
const { uploadMiddleware, reportsPhotoFolder } = require('../middleware/upload');

const {deletePhoto} = require("../helpers/imageDeleter");


//Rutas de accion
router.post("/new", auth, uploadMiddleware.array('photo',10), async (req, res) => {
    try {
      const imagesData = req.files
  
      const names = imagesData.map(({ filename }) => filename);
  
      const { username , title, description, images, category,lat,long } = JSON.parse(req.body.report);
  
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
        category:category,
        lat:lat,
        long:long
      });
      // return new report
      res.status(201).json(report);
    } catch (err) {
      console.log(err);
    }
});
  
router.delete('/:id', auth, async (req, res) => {

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

router.put('/:id', auth, uploadMiddleware.array('photo',10), async (req, res) => {

    // Get user input
    const imagesData = req.files
    const id  = req.params.id;

    try {

        let report = await Report.findOne({ _id: id });
        
        const names = imagesData.map(({ filename }) => filename);

        const { username , title, description, category, attentionDate,lat,long } = JSON.parse(req.body.report);

        let rankUser = await User.findOne({username:username});
        
        //solo el usuario original puede modificarlo o si un admin lo intenta hacer
        if(username == report.username || rankUser.type == "admin"){

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
                
                if(lat != "" && long !=""){
                    report.lat = lat
                    report.long = long
                }

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



//routes para obtener
router.get('/all', auth, async (req, res) => {
    try {
        let reports = await Report.find();
        let reportsFilter = [];
        for (var i = 0; i < reports.length; i++) {
            if (reports[i].attentionDate == null) {
                reportsFilter.push(reports[i])
            }
        }
        //console.log('All reports were requested');
        res.json(reportsFilter);
    } catch (err) {
        res.status(503).end(`Request for all reports caused an error`);
        console.log(err.message);
    }
});

router.get('/userdata', auth, async (req, res) => {

    // Get user input
    const { username } = req.query;

    try {
        let report = await Report.find({ username: username });

        if (!report) {
            res.status(404).end(`report with id ${id} does not exist in this dojo`);
            //console.log(`report with id ${id} does not exist in this dojo`);
        }
        else {
            //console.log(`Sending report info for ${report}`);
            res.json(report);
        }
    } catch (err) {
        res.status(503).end(`Request for all reports of user caused an error`);
        //console.log(err.message);
    }
});



router.get('/:id', auth, async (req, res) => {

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

router.get('/images/:photoPath', auth, (req, res) => {
    let photoPath = req.params.photoPath;
    let fullPath = path.join(__dirname.slice(0, -6) + `/${reportsPhotoFolder}/` + photoPath)
    res.sendFile(fullPath);
});

module.exports = router;