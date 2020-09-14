const express = require('express')
const routes = express.Router()

const chefController = require('../app/controllers/chefController')

const {onlyUsers} = require('../app/middlewares/session')
const multer = require('../app/middlewares/multer')
const sessionValidator = require('../app/validators/session')


routes.get("/",onlyUsers, chefController.index); // LIST
routes.get("/create", sessionValidator.onlyAdmin, chefController.create); // CREATE
routes.get("/:id",onlyUsers, chefController.show); // SHOW
routes.get("/:id/edit", sessionValidator.onlyAdmin, chefController.edit); // EDIT

routes.post("/", multer.array('photo',1) , chefController.post); // POST
routes.put("/:id", multer.array('photo',1) , chefController.put); // PUT/ATT
routes.delete("/", chefController.delete); // DELETE

module.exports = routes
