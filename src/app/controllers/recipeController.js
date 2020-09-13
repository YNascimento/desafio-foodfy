const Recipe = require('../models/Recipe')
const Chef = require('../models/Chef')
const File = require('../models/File')
const Recipe_File = require('../models/Recipe_File')

const loadService = require('../services/loadService')

const fs = require('fs')


module.exports = {
    async all(req,res){

        try {
            const isAdmin = req.session.isAdmin
            const userId = req.session.userId
            const {filter, page, limit, byUser} = req.query
            const isBusca = 0
            //pagination prep
            let {recipes, pagination, filterReturn} = await loadService.getPaginate(filter, page, limit, isBusca,byUser, userId)
    
            //get recipe imgs
            const filePromises = recipes.map(recipe => loadService.getImages(recipe.id))
            const allFiles = await Promise.all(filePromises)
            const files = allFiles.map(file => file[0])
    
            return res.render('admin/recipes/list', {recipes, pagination, filter : filterReturn, files, isAdmin})
            
        } catch (err) {
            console.error(err)
            return res.render('parts/layoutAdmin', {userId, error:"Erro ao carregar página!"})
        }
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
            const {recipe, files, chef} = await loadService.getRecipe(req.params.id)
            
            recipe.chef_name = chef.name

            //check if user created this recipe
            let owner = recipe.user_id == req.session.userId ? true : false
    
    
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
            let results = await loadService.getRecipe(req.params.id)
            const {recipe, files} = results
            
            //get: chefs das seis primeiras receitas
            chef = await Chef.find(recipe.chef_id)
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
                ingredients: `{${ingredients}}`,
                preparation: (`{${preparation}}`),
                information,
                user_id: req.session.userId
            })
            
            //create: files
            const filePromises = req.files.map(file => File.create({
                name: file.filename,
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
    
            let {id, title, chef_id, ingredients, preparation, information} = req.body
            const recipeId = id

            if(req.files.length != 0){ //new files

                //create: files
                const newFilesPromise = req.files.map(file => File.create({
                    name: file.filename,
                    path: file.path,
                    recipe_id: recipeId
                }))
                const filesId = await Promise.all(newFilesPromise)
    
                //create: recipe_files
                const recipeFilePromises = filesId.map(fileId => Recipe_File.create({
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
                filesPromise = removedFilesIds.map(fileId => File.find(fileId))
                files = await Promise.all(filesPromise)
    
                //delete from DB
                const removedFilesPromise = removedFilesIds.map(id => File.delete(id))
                await Promise.all(removedFilesPromise)

                //delete from public/img
                files.map(file => fs.unlinkSync(file.path))
            }
    
            await Recipe.update(recipeId, {
                chef_id,
                title,
                ingredients: `{${ingredients}}`,
                preparation: (`{${preparation}}`),
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