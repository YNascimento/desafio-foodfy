const User = require("../models/User")
const {compare} = require('bcryptjs')
const {onlyUsers, isAdmin, isLogged} = require('../middlewares/session')

module.exports = {
    async login(req,res,next){
        const {email, password} = req.body

        const user = await User.find({where: {email}})

        if(!user) return res.render('session/login', {
            user:req.body,
            error: "Usuário não cadastrado"
        })

        const passed = await compare(password, user.password)
        if(!passed) return res.render('session/login', {
            user: req.body,
            error: "Senha incorreta!"
        })
        req.user = user
        
        isAdmin(req, res, user, next)
        next()
    },
    async forgot(req,res,next){
        const {email} = req.body

        const user = await User.find({ where: {email} })
        if(!user) return res.render('session/forgot-password', {
            user:req.body,
            error: "E-mail não cadastrado!"
        })

        req.user = user
        next()        
    },
    async reset(req,res,next){
        const {email, password, passwordRepeat, token} = req.body

        const user = await User.find({ where: {email} })
        if(!user) return res.render('session/reset-password', {
            token,
            user:req.body,
            error: "E-mail não cadastrado!"
        })

        if(password != passwordRepeat) return res.render('session/reset-password', {
            token,
            user:req.body,
            error: "Digite a mesma senha nos dois campos!"
        })

        if(token != user.token) return res.render('session/reset-password', {
            token,
            user:req.body,
            error: "Token Inválido."
        })

        let now = new Date()
        now = now.setHours(now.getHours())
        if(now > user.reset_token_expires) return res.render('session/reset-password', {
            token,
            user:req.body,
            error: "Token Expirou! Solicitar nova recuperação de senha."
        })

        req.user = user 
        next()
    },
    onlyAdmin(req,res,next){
        if(!req.session.isAdmin){
            return res.render('admin/layout',{ error:"Acesso Negado!" })
        }

        next()
    }
}