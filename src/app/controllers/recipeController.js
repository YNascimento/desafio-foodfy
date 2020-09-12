const Recipe = require('../models/Recipe')
const Chef = require('../models/Chef')
const File = require('../models/File')
const Recipe_File = require('../models/Recipe_File')

const loadService = require('../services/loadService')


module.exports = {
    async all(req,res){

        try {
            const isAdmin = req.session.isAdmin
            const userId = req.session.userId
    
            //pagination prep
            let {filter, page, limit, byUser} = req.query

            const {pagination, filter} = loadService.paginate(filter, page, limit, null, byUser, userId)
    
            //get recipe imgs
            const filePromises = recipes.map(recipe => {loadService.getImages(recipe.id)})
            const files = await Promise.all(filePromises)
    
            return res.render('admin/recipes/list', {recipes, pagination, filter, files, isAdmin})
            
        } catch (err) {
            console.error(err)
            return res.render('admin/layout', {userId, error:"Erro ao carregar página!"})
        }

        // .then((values) => {
        //     const files = values.map(file => ({...file[0]}))
        //     if(files){
        //         if(typeof files[0] !== 'undefined' && typeof files[0].id !== 'undefined'){
        //             const files2 = files.map(file => ({
        //                 ...file,
        //                 src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
        //             }))
        //         }   
        //     }
        // })
    },
    async create(req,res){
        const isAdmin = req.session.isAdmin

        try {
            const chefs = await Chef.findAll()
    
            return res.render('admin/recipes/create', {chefs, isAdmin})
            
        } catch (error) {
            console.error(err)
            return res.render('admin/recipes/create', {isAdmin, error:"Erro ao carregar página!"})
        }
    },
    async show(req,res){
        const isAdmin = req.session.isAdmin
        
        try {
            //check if user created this recipe
            let owner = recipe.user_id == req.session.userId ? true : false
    
            let results = loadService.getRecipe(req.params.id)
            const {recipe, files} = results
    
            //get: chefs das seis primeiras receitas
            chef = await Chef.find({where: {id: recipe.chef_id} })
            recipe.chef_name = chef.name
    
            return res.render('admin/recipes/show',{recipe, files, isAdmin, owner})
            
        } catch (err) {
            console.error(err)
            return res.render('admin/recipes', {userId, error:"Erro ao carregar página!"})
        }
    },
    async edit(req,res){
        const isAdmin = req.session.isAdmin

        try {
            //get: recipe and recipe's files
            let results = loadService.getRecipe(req.params.id)
            const {recipe, files} = results
            
            //get: chefs das seis primeiras receitas
            chef = await Chef.find({where: {id: recipe.chef_id} })
            recipe.chef_name = chef.name
    
            const chefs = await Chef.findAll()
    
            return res.render('admin/recipes/edit', {chefs, recipe, files, isAdmin})
            
        } catch (err) {
            console.error(err)
            return res.render('admin/recipes/edit', {userId, error:"Erro ao carregar página!"})
        }
    },
    async post(req,res){

        try {
            for(key of Object.keys(req.body)){
                if(req.body[key] == "" && key != "information"){
                    return res.send(req.body)
                }
            }
            
            if(req.files.length == 0)
                return res.send('Upload at least one image')
    
            const {title, chef_id, ingredients, preparation, information} = req.body
    
            //create: recipe
            const recipeId = await Recipe.create({
                chef_id,
                title,
                ingredients,
                preparation,
                information,
                user_id: req.session.userId
            })
            
            //create: files
            const filePromises = req.files.map(file => File.create({
                name: file.name,
                path: file.path,
                recipe_id: recipeId
            }))
            const filesId = await Promise.all(filePromises)
    
            //create: recipe_files
            const recipeFilePromises = filesId.map(fileId => Recipe_File.create({
                recipe_id: recipeId,
                file_id: fileId
            }))
            await Promise.all(recipeFilePromises)
    
            return res.redirect(`/admin/recipes/${recipeId}`)
            
        } catch (err) {
            console.error(err)
        }

    },
    async put(req,res){
        try {
            //check if number of fields on req.body equals number on data.recipes
            for(key of Object.keys(req.body)){
                if( req.body[key] =="" && key != "removed_files" && key != "information"){
                    res.send('Please, fill all the fields')
                }
            }
    
            const {recipeId: id, title, chef_id, ingredients, preparation, information} = req.body
    
            if(req.files.length != 0){ //new files
    
                //create: files
                const newFilesPromise = req.files.map(file => File.create({
                    name: file.name,
                    path: file.path,
                    recipe_id: recipeId
                }))
                const filesId = await Promise.all(newFilesPromise)
    
                //create: recipe_files
                const recipeFilePromises = filesId.map(fileId => File.create({
                    recipe_id: recipeId,
                    file_id: fileId
                }))
                await Promise.all(recipeFilePromises)
            }
    
            if(req.body.removed_files){ //old files deleted
                
                //get all delete files ids
                const removedFilesIds = req.body.removed_files.split(',')
                const lastIndex = removedFilesIds.length-1
                removedFilesIds.splice(lastIndex,1)
    
                //pull files to be deleted
                filesPromise = removedFilesIds.map(fileId => File.find({where: {id: fileId} }))
                files = await Promise.all(filesPromise)
    
                //delete from public/img
                files.map(file => fs.unlinkSync(file.path))
    
                //delete from DB
                const removedFilesPromise = removedFilesIds.map(id => File.delete(id))
                await Promise.all(removedFilesPromise)
            }
    
            await Recipe.update(recipeId, {
                chef_id,
                title,
                ingredients,
                preparation,
                information,
                user_id: req.session.userId
            })
    
            return res.redirect(`/admin/recipes/${recipeId}`)
            
        } catch (err) {
            console.error(err)
        }

    },
    async delete(req,res){
        await Recipe.delete(req.body.id)
        return res.redirect('/admin/recipes')
    }
}