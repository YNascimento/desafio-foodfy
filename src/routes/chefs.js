const express = require('express')
const routes = express.Router()
const multer = require('../app/middlewares/multer')
const chefController = require('../app/controllers/chefControler')


routes.get("/", chefController.index); // LIST
routes.get("/create", chefController.create); // CREATE
routes.get("/:id", chefController.show); // SHOW
routes.get("/:id/edit", chefController.edit); // EDIT

routes.post("/", multer.array('photos',1) , chefController.post); // POST
routes.put("/:id", multer.array('photos',1) , chefController.put); // PUT/ATT
routes.delete("/", chefController.delete); // DELETE

module.exports = routes
