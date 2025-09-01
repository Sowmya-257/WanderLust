const express = require("express");
const router = express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const { storage } =  require("../cloudConfig.js");
const upload = multer({ storage });


router.route("/")
        //Index Route
        .get( wrapAsync(listingController.index))
        //create route
        .post(isLoggedIn, upload.single("listing[image]"), validateListing,  wrapAsync(listingController.createListing));
        // .post(upload.single("listing[image]"),(req,res) =>{
        //         res.send(req.file);
        // });

//New Route
router.get("/new",isLoggedIn, listingController.renderNewForm);

router.route("/:id")
       //Show Route
      .get(wrapAsync(listingController.showListing))
       //update route
      .put( isLoggedIn, isOwner,upload.single("listing[image]"),validateListing, listingController.updateListing)
      //delete route
      .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

//edit route
router.get("/:id/edit" ,isLoggedIn, isOwner,wrapAsync( listingController.renderEditForm));

module.exports = router;
