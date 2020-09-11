const express = require('express')
const routes = express.Router()
const sessionController = require('../app/controllers/sessionController')
const userController = require('../app/controllers/userController')
const userValidator = require('../app/validators/user')
const sessionValidator = require('../app/validators/session')
const {onlyUsers, isLogged} = require('../app/middlewares/session')

// login/logout
routes.get('/login', isLogged, sessionController.loginForm)
routes.post('/login', sessionValidator.login, sessionController.login)
routes.post('/logout', sessionController.logout)

// reset password/forgot
routes.get('/forgot-password', sessionController.forgotForm)
routes.post('/forgot-password', sessionValidator.forgot, sessionController.forgot)
routes.get('/reset-password', sessionController.resetForm)
routes.post('/reset-password', sessionValidator.reset, sessionController.reset)

// ADMIN
routes.get('/', sessionValidator.onlyAdmin, userController.list) //Mostrar a lista de usuários cadastrados
routes.get('/create', sessionValidator.onlyAdmin, userController.createForm) //Mostrar form de criação
routes.get('/:id/edit', sessionValidator.onlyAdmin, userController.editForm) //Mostrar form de edição

routes.post('/', userValidator.create, userController.create) //Cadastrar um usuário
routes.put('/:id/edit',userValidator.adminUpdate, userController.adminUpdate) // Update de usuário por admin
routes.delete('/', userController.delete) // Deletar um usuário

//USER
routes.get('/profile', onlyUsers, userValidator.indexForm, userController.indexForm) //Mostrar usuário logado
routes.put('/profile', userValidator.indexUpdate, userController.indexUpdate) // Update de usuário por usuário

module.exports = routes
