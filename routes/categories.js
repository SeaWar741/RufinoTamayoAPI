require("dotenv").config();
//require("../config/database").connect();
const express = require("express");
const router = express.Router();


const Category = require("../model/category");
const auth = require("../middleware/auth");


router.post("/new", auth, async (req, res) => {
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
  
router.delete('/:id', auth, async (req, res) => {
  
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

router.put('/:id', auth, async (req, res) => {  
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

router.get('/all', auth, async (req, res) => {
    try {
        let categories = await Category.find();
        //console.log('All reports were requested');
        res.json(categories);
    } catch (err) {
        res.status(503).end(`Request for all categories caused an error`);
        console.log(err.message);
    }
});
  
router.get('/:id', auth, async (req, res) => {
  
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



module.exports = router;