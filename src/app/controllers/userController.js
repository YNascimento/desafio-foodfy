const User = require("../models/User")

const crypto = require('crypto')
const {hash} = require('bcryptjs')

const mailer = require('../../lib/mailer')
const user = require("../validators/user")

const createEmail = (password) =>`
    <h2>Criamos uma senha pra você!</h2>
    <p> Caso queria alterá-la, vá em "Esqueci minha senha" </p>
    <p>${password}</p>
    `

module.exports = {
    async list(req,res){
        try {
            const isAdmin = req.session.isAdmin
    
            const users = await User.findAll()
            return res.render('admin/users/list', {users, isAdmin})
            
        } catch (err) {
            console.error(err)
        }
    },
    createForm(req,res){
        const isAdmin = req.session.isAdmin

        return res.render('admin/users/create',{isAdmin})
    },
    async create(req,res){
        try {
            const {name, email, isAdmin} = req.body
            let is_admin = isAdmin == "1" ? true : false
            
            
            // let password = crypto.randomBytes(8).toString("hex")
            let password = '123'

            await mailer.sendMail({ //enviar email com senha gerada
                to: email,
                from: 'no-reply@foodfy.com.br',
                subject: 'Conta Criada. Aqui está sua senha!',
                html: createEmail(password),
            })
            password = await hash(password, 8)
    
            const userId = await User.create({
                name,
                email,
                password,
                is_admin,
            })
    
            let users = await User.findAll()
            return res.render('admin/users/list', {users, isAdmin: req.session.isAdmin, success: "Cadastro feito com sucesso!"})
            
        } catch (err) {
            console.error(err)
            let users = await User.findAll()
            return res.render('admin/users/list', {users, error: "Erro ao cadastrar usuário"})
        }
    },
    indexForm(req,res){
        const isAdmin = req.session.isAdmin
        
        return res.render('admin/users/index', {user : req.user, isAdmin})
    },
    async indexUpdate(req,res){
        const user = req.user
        
        try {
            const {name, email} = req.body
    
            await User.update(user.id, { name, email })
    
            return res.render(`admin/users/index`, {
                user: req.body,
                success: "Conta atualizada com sucesso!"
            })

        } catch (err) {
            console.error(err)
            return res.render(`admin/users/index`, {
                user: req.body,
                error: "Erro na atualização!"
            })
        }
        
        
    },
    async editForm(req,res){
        try {
            
            const isAdmin = req.session.isAdmin
            const user = await User.find(req.params.id)

            return res.render('admin/users/edit', {user, isAdmin})
            
        } catch (err) {
            console.error(err)
            const users = await User.findAll()
            return res.render('admin/users', {users, isAdmin, error: "Erro ao carregar usuário"})
        }
    },
    async adminUpdate(req,res){
        try {
            
            let {name, email, isAdmin} = req.body
            let is_admin = isAdmin == "1" ? true : false
            
            await User.update(req.body.id, {name, email, is_admin})
            
            isAdmin = req.session.isAdmin
    
            return res.render(`admin/users/edit`, {
                user:req.body,
                isAdmin,
                success: "Usuário atualizado!"
            })
            
        } catch (err) {
            console.error(err)
            return res.render(`admin/users/edit`, {
                user:req.body,
                error: "Erro ao atualizar usuário"
            })
        }

    },
    async delete(req,res){
        const id = req.body.id
        const userId = req.session.userId
        const isAdmin = req.session.isAdmin
        
        const user = await User.find(id)
        try {
            if(user.id != userId){ //check if user to be delete aren't themselves
                
                await User.delete(id)
        
                const users = await User.findAll()

                return res.render('admin/users/list', {
                    users,
                    success: "Usuário Excluido com sucesso!"
                })
            }
            else{
                const users = await User.findAll()
                return res.render('admin/users/list', {
                    users,
                    error: "Não é possível excluir a si mesmo."
                })
            }
            
        } catch (err) {
            console.error(err)
            return res.render('admin/users/edit', {user, isAdmin, error: "Erro ao deletar usuário!"})

        }

    }
}