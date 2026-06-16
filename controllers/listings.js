const Listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
              path: "author",
            }
        })
        .populate("owner");
       if (!listing) {
         req.flash("error", "Listing you requested for does not exist!");
         res.redirect("/listings");
        }
      console.log(listing);
      res.render("listings/show.ejs", { listing });
};

//module.exports.createListing = async (req, res, next) => {
// let url = req.file.path;
//  let filename = req.file.filename;
//  const newListing = new Listing(req.body.listing);
//  newListing.owner = req.user._id;
//  newListing.image = {url, filename};
//  await newListing.save();
//  req.flash("success", "New Listing Created!");
//  res.redirect("/listings");
//};
module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  let geoResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: {
      q: `${req.body.listing.location}, ${req.body.listing.country}`,
      format: "json",
      limit: 1,
    },
    headers: {
      "User-Agent": "WanderlustApp/1.0",
    },
  });

  let geoData = geoResponse.data[0];

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = {
    type: "Point",
    coordinates: [
      parseFloat(geoData.lon),
      parseFloat(geoData.lat),
    ],
  };

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist!");
      return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

  if(req.file) {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
   let { id } = req.params;
   req.flash("success", "Listing Deleted!");
   await Listing.findByIdAndDelete(id);
   res.redirect("/listings");
};