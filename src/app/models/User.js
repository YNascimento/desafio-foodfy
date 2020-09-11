const db = require('../../config/db')

module.exports = {
    async all(){
        try {
            let results = await db.query(`SELECT * FROM users`)
            return results.rows
            
        } catch (err) {
            console.log('erro User.all')
            console.error(err)
        }
    },
    async find(filters){
        try {

            let query = "SELECT * FROM users"
            
            //key = campo, field = valor dentro do campo
            //query "SELECT * FROM users WHERE email = (email enviado na req)"
            //caso tenha mais de um modo de verificar, usa-se 2 key: Where e OR/AND com seu respectivo field com o valor
            Object.keys(filters).map(key => {
                query = `${query} ${key}`

                Object.keys(filters[key]).map(field => {
                    query = `${query} ${field} = '${filters[key][field]}'`
                })
            })

            const results = await db.query(query)
            return results.rows[0]

        } catch (err) {
            console.log('erro User.find')
            console.error(err)
        }
    },
    async create(data){
        try {
            const query = `INSERT INTO users (
                name, email, password, is_admin
            ) VALUES ($1,$2,$3,$4) RETURNING id`

            const values = [ data.name, data.email, data.password, data.isAdmin]

            let results = await db.query(query,values)
            return results.rows[0].id

        } catch (err) {

            console.log('erro User.create')
            console.error(err)
        }
    },
    async update(id,fields){
        try {
            
            let query = 'UPDATE users SET'

            Object.keys(fields).map((key, index, array) => {
                if((index+1) < array.length){ //iteration through array of update vars
                    query = `${query} ${key} = '${fields[key]}', `
                }
                else{ //last iteration
                    query = `${query} ${key} = '${fields[key]}' WHERE id = ${id}`
                }
            })
            await db.query(query)
            return

        } catch (err) {

            console.log('erro User.update')
            console.error(err)
        }
    },
    delete(id){
        try {
            let results = db.query(`DELETE FROM users WHERE id = $1`,[id])
        } catch (err) {
            console.log('erro User.delete')
            console.error(err)
        }
        return
    }
}