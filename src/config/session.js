const session = require('express-session')
const pgSession = require('connect-pg-simple')(session) //retorna uma função
const db = require('./db')

module.exports = session({
    store: new pgSession( {pool:db} ), //config para criar a sessão e guardar no db
    secret: 'chavesecreta',
    resave: false, //resave tenta salvar sempre a sessão automaticamente
    saveUninitialized: false, //slava uma sessão sem dados, sessão "vazia"
    cookie: {maxAge: (30*24*60*60*1000)} //30 dias em milissegundos
})