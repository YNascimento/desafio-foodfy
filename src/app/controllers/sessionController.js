const crypto = require('crypto')
const User = require("../models/User")
const mailer = require('../../lib/mailer')
const { reset } = require('browser-sync')
const { hash } = require('bcryptjs')

module.exports = {
    loginForm(req,res){
        return res.render('session/login')
    },
    login(req,res){
        req.session.userId = req.user.id
        
        return res.redirect('/admin/recipes')
    },
    logout(req,res){
        req.session.destroy()
        return res.redirect('/')
    },
    forgotForm(req,res){
        return res.render('session/forgot-password')
    },
    async forgot(req,res){
        const user = req.user
        const token = crypto.randomBytes(20).toString("hex")

        //token expira em 1h
        let now = new Date()
        now = now.setHours(now.getHours() +1)

        //atualiza bd com token e hr de expiração para compare
        await User.update(user.id,{
            reset_token: token,
            reset_token_expires: now
        })

        //enviar email com um link de recuperação
        await mailer.sendMail({
            to: user.email,
            from: 'no-reply@launchstore.com.br',
            subject: 'Recuperação de Senha',
            html: `<h2>Esqueceu a senha né meu filho?</h2>
            <p> Eu te entendo. Toma aí um lik pra resolver seus problema: </p>
            <p>
                <a href="http://localhost:3002/admin/users/reset-password?token=${token}" target="_blank">Senha nova aqui com o pai</a>
            </p>`,
        })

        return res.render('session/forgot-password', {
            user:req.body,
            success: "Verifique seu email para renovar sua senha!"
        })

    },
    resetForm(req,res){
        return res.render('session/reset-password')
    },
    async reset(req,res){
        const {password, token} = req.body
        const {user} = req
        
        try {
            const newPassword = await hash(password,8)

            await User.update(user.id, {
                password: newPassword,
                reset_token: "",
                reset_token_expires: ""
            })
    
            return res.render('session/login',{
                user: req.body,
                success: "Senha atualizada com sucesso!"
            })

        } catch (err) {
            console.error(err)
            return res.render('session/reset-password',{
                user: req.body,
                token,
                error: "Erro Inexperado. Tente novamente!"
            })
        }


    }
}