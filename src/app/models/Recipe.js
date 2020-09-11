const db = require('../../config/db')
const { create } = require('browser-sync')
const {date} = require('../../lib/util')
const { off } = require('../../config/db')

module.exports = {
    home(){
        try {
            return db.query(`SELECT recipes.*, chefs.name as chef_name FROM recipes 
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id) order by created_at LIMIT 6`)
        } catch (err) {
            console.error(err)
        }
    },
    async create(data, userId){
        console.log(userId)

        const query = `
            INSERT INTO recipes (
                chef_id,
                title,
                ingredients,
                preparation,
                information,
                created_at,
                user_id
            ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`

        const values = [
            data.chef,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            date(Date.now()).iso,
            userId
        ]

        try {
            return await db.query(query,values)            
        } catch (err) {
            console.error(err)
        }

    },
    async find(id){
        try {
            return await db.query(`SELECT recipes.*, chefs.name as chef_name FROM recipes 
                LEFT JOIN chefs ON (recipes.chef_id = chefs.id) WHERE recipes.id = $1`,[id])
        } catch (err) {
            console.error(err)
        }
    },
    async update(data){
        const query = `UPDATE recipes SET
            chef_id = ($1),
            title = ($2),
            ingredients = ($3),
            preparation = ($4),
            information = ($5)
            WHERE id = ($6)`

        const values = [
            data.chef,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            data.id
        ]

        try {
            return await db.query(query,values)
        } catch (err) {
            console.error(err)
        }

    },
    async delete(id){
        try {
            let results = await db.query(`DELETE FROM recipes USING recipe_files WHERE recipes.id = $1 AND recipes.id = recipe_files.recipe_id RETURNING recipes.id`,[id])
            
            const fileId = results.rows[0].id
            results = await db.query(`DELETE FROM files WHERE recipe_id = $1`,[fileId])
            
            return results
        } catch (err) {
            console.error(err)
        }

    },
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