const Chef = require('../models/Chef')
const File = require('../models/File')
const Recipe = require('../models/Recipe')
const Recipe_File = require('../models/Recipe_File')

const fs = require('fs')

const loadService = require('../services/loadService')
const {date} = require('../../lib/util')

module.exports = {
    async index(req,res){
        try {
            const isAdmin = req.session.isAdmin
    
            //get all chefs
            const chefs = await Chef.findAll(null, 'ORDER BY created_at DESC')
    
            //get all chefs' imgs
            const chefFilePromise = chefs.map(chef => loadService.getImage(chef.file_id))
            let files = await Promise.all(chefFilePromise)

            //get total recipes from chefs
            const totalrecipesPromise = chefs.map(chef => Chef.totalRecipesByChef(chef.id))
            let totalRecipes = await Promise.all(totalrecipesPromise)
            
            chefs.map((chef,index) => chef.totalRecipes = totalRecipes[index].total)

            return res.render('admin/chefs/list', {chefs, files, isAdmin})
            
        } catch (err) {
            console.error(err)
        }
    },
    create(req,res){
        const isAdmin = req.session.isAdmin

        return res.render('admin/chefs/create', isAdmin)
    },
    async show(req,res){

        try {
            const isAdmin = req.session.isAdmin
            let {page, limit} = req.query
    
            const {chef, recipes, pagination, total_recipes, recipeFiles } = await loadService.getChefPaginate(req.params.id, page, limit)
    
            return res.render('admin/chefs/show',{chef, recipes, pagination, total_recipes, recipeFiles, isAdmin})
            
        } catch (err) {
            console.error(err)
        }
    },
    async edit(req,res){
            const isAdmin = req.session.isAdmin
            const chef = await Chef.find({where: {id: req.params.id}})

        try {

            if(!chef) {
                return res.render('parts/layoutAdmin',{error: "Chef não encontrado"})
            }
    
            chef.file = await File.find({where : {id: chef.file_id}})
            chef.file.src = `${req.protocol}://${req.headers.host}${chef.file.path.replace('public','')}`
    
            return res.render('admin/chefs/edit',{chef, isAdmin})
            
        } catch (err) {
            console.error(err)
            return res.render('parts/layoutAdmin',{error: "Erro ao carregar a página"})
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
    
            //create Chef file
            const fileId = await File.create({
                name: req.files[0].name,
                path: req.files[0].path
            })

            //fill recipe_file table
            await Recipe_File.create({
                file_id: fileId
            })
    
            //create chef
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