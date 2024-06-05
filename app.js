const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Restaurant = require("./models/restaurant");
const { resolveSoa } = require("dns");

mongoose.connect("mongodb://localhost:27017/halal-eats", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const app = express();

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended : true}))

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/restaurants", async (req, res) => {
  const restaurants = await Restaurant.find({});
  res.render("restaurants/index", { restaurants });
});

app.get("/restaurants/new", (req, res) => {
  res.render("restaurants/new");
})

app.post("/restaurants",async(req, res) =>{
  const restaurant = new Restaurant(req.body.restaurant);
  await restaurant.save();
  res.redirect(`/restaurants/${restaurant._id}`)
})

app.get("/restaurants/:id", async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  res.render("restaurants/show", { restaurant });
});

app.get("/restaurants/:id/edit", async(req, res) => {
  const restaurant = await Restaurant.findById(req.params.id)
  res.render("restaurants/edit", { restaurant });
});

app.listen(3000, () => {
  console.log("LISTENING ON PORT 3000!");
});
