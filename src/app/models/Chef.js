const db = require('../../config/db')
const {date} = require('../../lib/util')

module.exports = {
    async all(){
        try {
            return await db.query(`SELECT chefs.*,count(recipes) AS total_recipes 
                FROM chefs LEFT JOIN recipes ON (chefs.id = recipes.chef_id) 
                GROUP BY chefs.id
                ORDER BY chefs.created_at DESC`)
        } catch (err) {
            console.error(err)
        }
    },
    async create(name,file_id){
        try {
            const query = `INSERT INTO chefs (
                name,
                file_id,
                created_at
                ) VALUES ($1,$2,$3) RETURNING id`
    
            const values = [name, file_id, date(Date.now()).iso]

            return await db.query(query,values)
        } catch (err) {
            console.error(err)
        }

    },
    async find(id){
        try {
            return await db.query(`SELECT * FROM chefs WHERE id = $1`,[id])
        } catch (err) {
            console.error(err)
        }
    },
    async update(id,name,file_id){
        try {
            const query = `UPDATE chefs SET
                    name = ($1),
                    file_id = ($2)
                    WHERE id = ($3)`
            const values = [name, file_id, id]
            
            return await db.query(query,values)
        } catch (err) {
            console.error(err)
        }
    },
    async delete(id){
        try {
            return await db.query(`DELETE FROM chefs WHERE id = $1`, [id])
        } catch (err) {
            console.error(err)
        }
    },
    async recipesBy(id, params){

        const {offset, limit} = params

        let query = `SELECT * FROM recipes WHERE chef_id = $1 
        ORDER BY created_at DESC LIMIT $2 OFFSET $3`

        try {
            return await db.query(query,[id, limit, offset])
        } catch (err) {
            console.error(err)
        }

    },
    async totalRecipesByChef(id){
        try {
            return await db.query('SELECT count(recipes) AS total FROM recipes WHERE chef_id = $1',[id])
        } catch (error) {
            console.error(err)
        }
    },
    paginate(params){},
}