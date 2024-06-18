const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const axios = require("axios");
const Restaurant = require("./models/restaurant");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

mongoose.connect("mongodb://localhost:27017/halal-eats", {});

const app = express();

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/restaurants", async (req, res) => {
  const restaurants = await Restaurant.find({});
  res.render("restaurants/index", { restaurants });
});

app.get("/restaurants/new", (req, res) => {
  res.render("restaurants/new");
});

app.post("/restaurants", async (req, res) => {
  const restaurant = new Restaurant(req.body.restaurant);
  await restaurant.save();
  res.redirect(`/restaurants/${restaurant._id}`);
});

app.get("/restaurants/:id", async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  res.render("restaurants/show", { restaurant });
});

app.get("/restaurants/:id/edit", async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  res.render("restaurants/edit", { restaurant });
});

app.put("/restaurants/:id", async (req, res) => {
  const { id } = req.params;
  const restaurant = await Restaurant.findByIdAndUpdate(id, { ...req.body.restaurant });
  res.redirect(`/restaurants/${restaurant._id}`);
});

app.delete("/restaurants/:id", async (req, res) => {
  const { id } = req.params;
  await Restaurant.findByIdAndDelete(id);
  res.redirect("/restaurants");
});

app.get("/yelp", async (req, res) => {
  const { term, location } = req.query;
  const apiKey = 'kG9HkWDz1qAOJFoDfNwSoe6PJAy0SX8NmHOdhz20SyXWrwxEN1qjb98puWms8N1JO3mFZjmoodM6Ti7pwH9lZ5HbqUE55CZhUlFNAV6FQ-DyuJ57uNbjPfiH3r9xZnYx'; // Replace with your Yelp API Key
  try {
    const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      params: {
        term,
        location
      }
    });
    const businesses = response.data.businesses;
    res.render("yelpResults", { businesses });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data from Yelp API");
  }
});

app.listen(3000, () => {
  console.log("LISTENING ON PORT 3000!");
});
