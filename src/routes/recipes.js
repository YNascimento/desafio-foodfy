const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')
const recipeController = require('../app/controllers/recipeController')
const {onlyUsers, isLogged} = require('../app/middlewares/session')


routes.get("/", onlyUsers, recipeController.all); // ALL RECIPES
routes.get("/myrecipes", onlyUsers, recipeController.all); // USER'S RECIPES
routes.get("/create", onlyUsers, recipeController.create); // CREATE
routes.get("/:id", onlyUsers, recipeController.show); // SHOW
routes.get("/:id/edit", onlyUsers, recipeController.edit); // EDIT

routes.post("/", multer.array('photos',5) ,recipeController.post); // POST
routes.put("/:id", multer.array('photos',5), recipeController.put); // PUT/ATT
routes.delete("/", recipeController.delete); // DELETE

module.exports = routes
