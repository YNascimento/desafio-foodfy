const db = require('../../config/db')
const Base = require('./Base')

Base.init({table:'chefs'})

module.exports = {
    ...Base,
    async recipesBy(id, params){

        const {offset, limit} = params

        let query = `SELECT * FROM recipes WHERE chef_id = ${id} ORDER BY created_at DESC`

        if(limit){
            query += ` LIMIT ${limit}`
            if(offset)
                query += `OFFSET ${offset}`
        }
        try {
            let results = await db.query(query)
            return results.rows
        } catch (err) {
            console.error(err)
        }

    },
    async totalRecipesByChef(id){
        try {
            let results = await db.query('SELECT count(recipes) AS total FROM recipes WHERE chef_id = $1',[id])
            return results.rows[0]
        } catch (error) {
            console.error(err)
        }
    },
}

// async all(){
//     try {
//         return await db.query(`SELECT chefs.*,count(recipes) AS total_recipes 
//             FROM chefs LEFT JOIN recipes ON (chefs.id = recipes.chef_id) 
//             GROUP BY chefs.id
//             ORDER BY chefs.created_at DESC`)
//     } catch (err) {
//         console.error(err)
//     }
// },
// async create(name,file_id){
//     try {
//         const query = `INSERT INTO chefs (
//             name,
//             file_id,
//             created_at
//             ) VALUES ($1,$2,$3) RETURNING id`

//         const values = [name, file_id, date(Date.now()).iso]

//         return await db.query(query,values)
//     } catch (err) {
//         console.error(err)
//     }
// },