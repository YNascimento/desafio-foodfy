const Chef = require('../models/Chef')
const File = require('../models/File')
const Recipe = require('../models/Recipe')

const fs = require('fs')

const loadService = require('../services/loadService')
const {date} = require('../../lib/util')

module.exports = {
    async index(req,res){
        try {
            const isAdmin = req.session.isAdmin
    
            let allChefs = await Chef.findAll(null, 'created_at DESC' ) // 1:1 para passar pelo map de Where
            chefsPromise = allChefs.map(async chef => {
    
                chef.total_recipes = await Recipe.findAll({where: {chef_id: chef.id}})
                chef.file = await loadServie.getImage(chef.file_id)
                return chef
            })
            const chefs = await Promise.all(chefsPromise)            
            
            return res.render('admin/chefs/list', {chefs, isAdmin})
            
        } catch (err) {
            console.error(err)
        }
        
        // await Promise.all(chefsPromise).then(values => {   
            //     files = values.map(file =>({
                //         ...file,
                //         src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
                //     }))
            // })


    },
    create(req,res){
        const isAdmin = req.session.isAdmin

        return res.render('admin/chefs/create', isAdmin)
    },
    async show(req,res){

        try {
            const isAdmin = req.session.isAdmin
    
            //get chef
            const chef = await Chef.find({where: {id: req.params.id}}) 
            if(!chef) res.send("Chef not found")
    
            //get chef img
            chef.file = await File.find({where: {id: chef.file_id}})
            chef.file.src = `${req.protocol}://${req.headers.host}${chef.file.path.replace('public','')}`
    
            //get img to all chef's recipes
            const filePromises = recipes.map(recipe => {loadService.getImages(recipe.id)})
            const recipeFiles = await Promise.all(filePromises)
    
            //pagination prep
            let {page, limit} = req.query
            page = page || 1
            limit = limit || 4
        
            let offset = limit*(page-1)
            const params = {page, limit, offset }
    
            const recipes = await Chef.recipesBy(chef.id, params) //recipes with pagination
    
            const total_recipes = await Chef.totalRecipesByChef(chef.id)
    
            const pagination = {
                total: Math.ceil(total_recipes.total/limit), //total pages
                page
            }
    
            return res.render('admin/chefs/show',{chef, recipes, pagination, total_recipes, recipeFiles, isAdmin})
            
        } catch (err) {
            console.error(err)
        }
        // const filePromises = recipes.map(recipe => File.getFilesByRecipe(recipe.id))
        // await Promise.all(filePromises).then((values) => {

        //     const files = values.map(file => ({...file[0]}))
        //     if(files){
        //         if(typeof files[0] !== 'undefined' && typeof files[0].id !== 'undefined'){

        //             const files2 = files.map(file => ({
        //                 ...file,
        //                 src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
        //             }))

        //             return res.render('admin/chefs/show',{chef, recipes, pagination, total_recipes, chefFile, recipeFiles : files2, isAdmin})
        //         }
        //     }
        //     return res.render('admin/chefs/show',{chef, recipes, total_recipes, chefFile, isAdmin})
        // })
    },
    async edit(req,res){
            const isAdmin = req.session.isAdmin
            const chef = await Chef.find({where: {id: req.params.id}})

        try {

            if(!chef) {
                return res.render('admin/layout',{error: "Chef não encontrado"})
            }
    
            chef.file = await File.find({where : {id: chef.file_id}})
            chef.file.src = `${req.protocol}://${req.headers.host}${chef.file.path.replace('public','')}`
    
            return res.render('admin/chefs/edit',{chef, isAdmin})
            
        } catch (err) {
            console.error(err)
            return res.render('admin/layout',{error: "Erro ao carregar a página"})
        }
    },
    async post(req,res){
        try {
            for(key of Object.keys(req.body)){
                if(req.body[key] == ""){
                    res.send("Fill all the fields")
                }
            }
    
            const {name} = req.body
    
            const fileId = await File.create({
                name: req.files[0].name,
                path: req.files[0].path
            })
    
            const chef = await Chef.create({
                name,
                file_id: fileId
            })
    
            return res.redirect(`/admin/chefs/${chef.id}`)
            
        } catch (err) {
            console.error(err)
        }

    },
    async put(req,res){
        try {
            //check if number of fields on req.body equals number on data.recipes
            for(key of Object.keys(req.body)){
                if(req.body[key] =="" && key != "removed_files"){
                    res.send(req.body)
                }
            }
    
            let chef = await Chef.find({where:{id: req.body.id}})
            let file = await File.find({where:{id: chef.file_id}})
            let fileId
            
            if(req.files && req.files.length != 0){
                
                //CHECAR E REFAZER O UNLINK PARA O FILE
                fs.unlinkSync(file.path)
    
                if(req.body.removed_files){
                    const removedFile = req.body.removed_files //receives the file_id
                    await File.delete(removedFile)
                }
    
                fileId = await File.create({
                    name: req.files[0].name,
                    path: req.files[0].path
                })
            }
    
            await Chef.update(req.body.id, {
                name : req.body.name,
                file_id: fileId
            })
    
            return res.redirect(`/admin/chefs/${req.body.id}`)
            
        } catch (err) {
            console.error(err)            
        }

    },
    async delete(req,res){
        await Chef.delete(req.body.id)
        return res.redirect('/admin/chefs')
    }
}