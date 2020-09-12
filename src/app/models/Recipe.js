const db = require('../../config/db')
const Base = require('./Base')

Base.init({ table:'recipes'}) //calls Base file parsing the reference table

module.exports = {
    ...Base,
    async chefOptions(){
        try {
            return await db.query(`SELECT name, id FROM chefs ORDER BY name ASC`)
        } catch (err) {
            console.error(err)
        }
    },
    async paginate(params){
        const {filter, offset, limit, isBusca, byUser, userId} = params

        let query = "",
        filterQuery = "",
        totalQuery = `(SELECT count(*) FROM recipes) AS total`,
        orderQuery = ""

        if(filter){
            filterQuery = ` WHERE recipes.title ILIKE '%${filter}%'`
            totalQuery = `(SELECT count(*) FROM recipes ${filterQuery}) AS total`
            
            if(byUser) filterQuery = ` WHERE recipes.title ILIKE '%${filter}%' AND recipes.user_id = ${userId}`
        }

        if(byUser && filterQuery == ""){
            filterQuery = `WHERE recipes.user_id = ${userId}`
        }

        if(isBusca) orderQuery = "ORDER BY recipes.updated_at DESC"
        else orderQuery = "ORDER BY recipes.created_at DESC"
        
        query = `SELECT recipes.*, ${totalQuery}, chefs.name AS chef_name
            FROM recipes LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            ${filterQuery} ${orderQuery}
            LIMIT $1 OFFSET $2`
        
        try {
            return await db.query(query,[limit,offset])
        } catch (err) {
            console.error(err)
        }
    },
}

// home(){
//     try {
//         return db.query(`SELECT recipes.*, chefs.name as chef_name FROM recipes 
//         LEFT JOIN chefs ON (recipes.chef_id = chefs.id) order by created_at LIMIT 6`)
//     } catch (err) {
//         console.error(err)
//     }
// },
// async find(id){
    //     try {
    //         return await db.query(`SELECT recipes.*, chefs.name as chef_name 
    //             FROM recipes 
    //             LEFT JOIN chefs ON (recipes.chef_id = chefs.id) 
    //             WHERE recipes.id = $1`, [id])
    //     } catch (err) {
    //         console.error(err)
    //     }
    // },
    // async delete(id){
    //     try {
    //         let results = await db.query(`DELETE FROM recipes USING recipe_files WHERE recipes.id = $1 AND recipes.id = recipe_files.recipe_id RETURNING recipes.id`,[id])
            
    //         const recipeId = results.rows[0].id
    //         results = await db.query(`DELETE FROM files WHERE recipe_id = $1`,[recipeId])
            
    //         return results
    //     } catch (err) {
    //         console.error(err)
    //     }

    // },