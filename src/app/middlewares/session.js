const User = require("../models/User")

module.exports = {
    onlyUsers(req,res,next){
        if(!req.session.userId)
            return res.render('session/login', {error: "Acesso não permitido. Faça Login"})
        
        next()
    },
    async isAdmin(req, res, user, next){
        
        if(!user.is_admin) {
            req.session.isAdmin = false
            return
        }

        req.session.isAdmin = true        
        next()
    },
    isLogged(req,res,next){
        if(req.session.userId)
            return res.redirect('/admin/users/profile')
        
        next()
    }
}