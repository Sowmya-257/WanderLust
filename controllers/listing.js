const Listing = require("../models/listing.js");
const { cloudinary } = require("../cloudConfig");

module.exports.index = async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    } catch (error) {
        req.flash("error", "Unable to load listings.");
        res.redirect("/listings");
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    try {
        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: { path: "author" }
            })
            .populate("owner");

        if (!listing) {
            req.flash("error", "Listing does not exist");
            return res.redirect("/listings");
        }

        // Check if the image URL is present, otherwise set the default image URL
        if (!listing.image || !listing.image.url) {
            listing.image = { url: 'https://i.pinimg.com/originals/cd/a2/ab/cda2ab771d01b5e6f09266628874cc69.jpg' };
        }
        res.render("listings/show", { listing });
    } catch (error) {
        req.flash("error", "Unable to display the listing.");
        res.redirect("/listings");
    }
};

module.exports.createListing = async (req, res) => {
    try {
        const { listing } = req.body;
        if (req.file) {
            listing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        } else {
            listing.image = {
                url: 'https://i.pinimg.com/originals/cd/a2/ab/cda2ab771d01b5e6f09266628874cc69.jpg',
                filename: 'default_image'
            };
        }

        const newListing = new Listing(listing);
        newListing.owner = req.user._id;

        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (error) {
        req.flash("error", "There was a problem creating your listing.");
        res.redirect("/listings/new");  // Redirect back to new listing page
    }
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    try {
        // Find the listing by ID and populate owner and reviews
        const listing = await Listing.findById(id)
            .populate('owner')
            .populate('reviews');

        if (!listing) {
            req.flash("error", "Listing does not exist");
            return res.redirect("/listings");
        }

        // Handle case where there might not be an image
        let originalUrl = listing.image?.url || 'https://default-image-url.com';
        // If the listing has an image, modify its URL
        if (originalUrl !== 'https://default-image-url.com') {
            originalUrl = originalUrl.replace("/upload", "/upload/h_300/w_250");
        }

        // Render the edit form with the listing and the processed image URL
        res.render("listings/edit", { listing, originalUrl });
    } catch (error) {
        req.flash("error", "Unable to load edit form.");
        res.redirect("/listings"); // Redirect in case of error
    }
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const { listing } = req.body;
    try {
        const updatedListing = await Listing.findByIdAndUpdate(id, listing, { new: true });

        // Only proceed with Cloudinary destruction if there is an existing image to delete
        if (req.file) {
            // Check if the listing already has an image that should be deleted
            if (updatedListing.image && updatedListing.image.filename && updatedListing.image.filename !== 'default_image') {
                await cloudinary.uploader.destroy(updatedListing.image.filename);
            }

            updatedListing.image = {
                url: req.file.path,
                filename: req.file.filename  // Cloudinary assigns this as the public_id
            };
        }

        await updatedListing.save();
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    } catch (error) {
        req.flash("error", "There was a problem updating your listing.");
        res.redirect(`/listings/${id}/edit`);
    }
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    try {
        let deletedListing = await Listing.findByIdAndDelete(id);
        // Only destroy the image if it's not a default image
        if (deletedListing.image && deletedListing.image.filename && deletedListing.image.filename !== 'default_image') {
            await cloudinary.uploader.destroy(deletedListing.image.filename); // Use the filename (public_id) to destroy the image
        }

        req.flash("success", "Listing Deleted!");
        res.redirect("/listings");
    } catch (error) {
        req.flash("error", "There was a problem deleting the listing.");
        res.redirect("/listings");
    }
};
