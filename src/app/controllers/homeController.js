const Recipe = require('../models/Recipe')
const Chef = require('../models/Chef')
const File = require('../models/File')

module.exports = {
    async index(req,res){
        let results = await Recipe.home()
        const recipes = results.rows
        const userId = req.session.userId

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
                    return res.render('home/index', {recipes, files: files2,userId})
                }
            }
            return res.render('home/index', {recipes, userId})
 
        })
    },
    async recipes(req,res){

        const userId = req.session.userId

        //pagination prep
        let {filter, page,limit} = req.query
        page = page || 1
        limit = limit || 3
    
        let offset = limit*(page-1)
        let isBusca = 0 //bit para identificação se a req pro bd vem de filtro de busca ou não
        const params = { filter, page, limit, offset, isBusca }
        
        let results = await Recipe.paginate(params)
        const recipes = results.rows
        
        const pagination = {
            total: Math.ceil(recipes[0].total/limit), //total pages
            page
        }

        //getting recipe imgs
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
                    return res.render('home/recipes', {recipes, pagination, filter, files: files2, userId})
                }
            }

            return res.render('home/recipes', {recipes,pagination, filter, userId})
        })
    },
    about(req,res){
        const userId = req.session.userId

        return res.render('home/about',{userId})
    },
    async show(req, res){
        const userId = req.session.userId

        let results = await Recipe.find(req.params.id)
        const recipe = results.rows[0]

        if(!recipe) res.send("Recipe not found")

        results = await File.getFileIds(recipe.id)
        const fileIds = results.rows

        const filesPromises = fileIds.map(id => File.getFiles(id.file_id))
        await Promise.all(filesPromises).then((results) => {

            const files = results.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
            }))
            return res.render('home/show',{recipe, files, userId})
        })
    },
    async chefs(req,res){
        const userId = req.session.userId

        let results = await Chef.all()
        const chefs = results.rows

        const chefFilePromise = chefs.map(chef => File.getFiles(chef.file_id))
        await Promise.all(chefFilePromise).then(values => {
            
            files = values.map(file =>({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
            }))
            return res.render('home/chefs', {chefs, files, userId})
        })
    },
    async busca(req,res){
        const userId = req.session.userId

        let {filter, page,limit} = req.query
        page = page || 1
        limit = limit || 3
        let isBusca = 1 //bit para identificação se a req pro bd vem de filtro de busca ou não
        let offset = limit*(page-1)
        const params = {filter, page, limit, offset, isBusca}
        
        let results = await Recipe.paginate(params)
        const recipes = results.rows

        const pagination = {
            total: recipes[0] != null ? Math.ceil(recipes[0].total/limit) : 0, //total pages
            page
        }
        
        //getting recipe imgs
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
                    return res.render('home/filter', {recipes, pagination, filter, files: files2,userId})
                }
            }
            return res.render('home/filter', {recipes,pagination, filter, userId})
        })
    }
}