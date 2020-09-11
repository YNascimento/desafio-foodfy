const db = require('../../config/db')
const fs = require('fs')
const { getFiles } = require('./Recipe')

module.exports = {
    async create({filename, path}, recipeId){

        const query = ` INSERT INTO files (
            name,
            path,
            recipe_id
        ) VALUES ($1, $2, $3)
        RETURNING id`

        const values = [filename, path, recipeId]

        try {
            return await db.query(query,values)
            
        } catch (err) {
            console.error(err)
        }
    },
    async delete(id){
        try {
            let result = await db.query('SELECT * FROM files WHERE id = $1',[id])
            const file = result.rows[0]
        
            //delete arquivo do caminho enviado
            fs.unlinkSync(file.path)

            return await db.query(`DELETE FROM files USING recipe_files 
                WHERE files.id = $1 AND files.id = recipe_files.file_id`,[id])
        }
        catch(err){
            console.error(err)
        }        
    },
    async indentifyFile(id,recipeId){
        const query = `INSERT INTO recipe_files (
            file_id,
            recipe_id
        ) VALUES ($1, $2) RETURNING id`

        const values = [id, recipeId,]
        
        try {
            return await db.query(query,values)

        } catch (err) {
            console.error(err)    
        }
    },
    async getFileIds(recipeId){
        try {
            return await db.query(`SELECT file_id FROM recipe_files WHERE recipe_id = $1`,[recipeId])

        } catch (err) {
            console.error(err)
        }
    },
    async getFiles(id){
        try {
            files = await db.query(`SELECT * FROM files WHERE id = $1`,[id])
            return files.rows[0]

        } catch (err) {
            console.error(err)
        }
    },
    async getFilesByRecipe(recipeId){
        try {
            let results = await db.query(`SELECT * FROM files WHERE recipe_id = $1`,[recipeId])
            return results.rows

        } catch (err) {
            console.error(err)
        }
    }
}