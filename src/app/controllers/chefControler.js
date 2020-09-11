const Chef = require('../models/Chef')
const File = require('../models/File')
const {date} = require('../../lib/util')
const {adminLogged} = require('../middlewares/session')

module.exports = {
    async index(req,res){
        const isAdmin = req.session.isAdmin

        let results = await Chef.all()
        const chefs = results.rows
        
        const chefFilePromise = chefs.map(chef => File.getFiles(chef.file_id))
        await Promise.all(chefFilePromise).then(values => {
            
            files = values.map(file =>({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
            }))
            return res.render('admin/chefs/list', {chefs, files, isAdmin})
        })

    },
    create(req,res){
        const isAdmin = req.session.isAdmin

        return res.render('admin/chefs/create', isAdmin)
    },
    async show(req,res){
        const isAdmin = req.session.isAdmin

        let results = await Chef.find(req.params.id)
        const chef = results.rows[0]

        if(!chef) res.send("Chef not found")

        //pagination prep
        let {page, limit} = req.query
        page = page || 1
        limit = limit || 4
    
        let offset = limit*(page-1)
        const params = {page, limit, offset }

        results = await Chef.recipesBy(chef.id, params)
        const recipes = results.rows

        results = await Chef.totalRecipesByChef(chef.id)
        const total_recipes = results.rows[0]
        const pagination = {
            total: Math.ceil(total_recipes.total/limit), //total pages
            page
        }

        results = await File.getFiles(chef.file_id)
        const chefFile = results
        chefFile.src = `${req.protocol}://${req.headers.host}${chefFile.path.replace('public','')}`


        //array de promises para pegar imgs de receitas
        const filePromises = recipes.map(recipe => File.getFilesByRecipe(recipe.id))
        await Promise.all(filePromises).then((values) => {

            const files = values.map(file => ({...file[0]}))
            if(files){
                if(typeof files[0] !== 'undefined' && typeof files[0].id !== 'undefined'){

                    const files2 = files.map(file => ({
                        ...file,
                        src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
                    }))

                    return res.render('admin/chefs/show',{chef, recipes, pagination, total_recipes, chefFile, recipeFiles : files2, isAdmin})
                }
            }
            return res.render('admin/chefs/show',{chef, recipes, total_recipes, chefFile, isAdmin})

        })
    },
    async edit(req,res){
        const isAdmin = req.session.isAdmin
        
        let results = await Chef.find(req.params.id)
        const chef = results.rows[0]

        if(!chef) res.send("Chef not found")

        results = await File.getFiles(chef.file_id)
        const chefFile = results
        chefFile.src = `${req.protocol}://${req.headers.host}${chefFile.path.replace('public','')}`

        return res.render('admin/chefs/edit',{chef, chefFile, isAdmin})
    },
    async post(req,res){
        for(key of Object.keys(req.body)){
            if(req.body[key] == ""){
                res.send("Fill all the fields")
            }
        }

        let results = await File.create({...req.files[0]})
        const fileId = results.rows[0].id


        results = await Chef.create(req.body.name,fileId)
        const chef = results.rows[0]

        return res.redirect(`/admin/chefs/${chef.id}`)
    },
    async put(req,res){
        //check if number of fields on req.body equals number on data.recipes
        for(key of Object.keys(req.body)){
            if(req.body[key] =="" && key != "removed_files"){
                res.send(req.body)
            }
        }

        let results = await Chef.find(req.body.id)
        let fileId = results.rows[0].file_id
        
        if(req.files && req.files.length != 0){
            
            if(req.body.removed_files){
                const removedFile = req.body.removed_files
                await File.delete(removedFile)
            }

            let results = await File.create({...req.files[0]})
            fileId = results.rows[0].id
        }


        results = await Chef.update(req.body.id, req.body.name, fileId)
        let chef = results.rows[0]

        return res.redirect(`/admin/chefs/${req.body.id}`)
    },
    async delete(req,res){
        let results = await Chef.delete(req.body.id)
        return res.redirect('/admin/chefs')
    }
}