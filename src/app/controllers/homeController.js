const Recipe = require('../models/Recipe')
const Chef = require('../models/Chef')
const File = require('../models/File')

const loadService = require('../services/loadService')

module.exports = {
    async index(req,res){
        const userId = req.session.userId

        try {
            //get: seis primeiras receitas por ordem de criação
            let recipes = await Recipe.findAll(null, 'ORDER BY created_at LIMIT 6')
    
            //get: chefs das seis primeiras receitas
            chefPromise = recipes.map(recipe => Chef.findAll({where: {id: recipe.chef_id} }))
            const chefs = await Promise.all(chefPromise)
            
            recipes.map((recipe, index) =>{
                recipe.chef_name = chefs[index][0].name
            })
    
            const filePromises = recipes.map(recipe => loadService.getImages(recipe.id))
            const allFiles = await Promise.all(filePromises)
            const files = allFiles.map(file => file[0])

            return res.render('home/index', {recipes, files, chefs, userId})
            
        } catch (err) {
            console.error(err)
            return res.render('home/index', {userId, error:"Erro ao carregar página!"})
        }
    },
    async recipes(req,res){

        const userId = req.session.userId

        try {
            //pagination prep
            let isBusca = 0 //bit para identificação se a req pro bd vem de filtro de busca ou não            
            const {recipes, pagination, filter} = await loadService.getPaginate(req.query.filter, req.query.page, req.query.limit, isBusca)
    
            //get recipe imgs
            const filePromises = recipes.map(recipe => loadService.getImages(recipe.id))
            const allFiles = await Promise.all(filePromises)
            const files = allFiles.map(file => file[0])
    
            return res.render('home/recipes', {recipes, pagination, filter, files, userId})
            
        } catch (err) {
            console.error(err)
            return res.render('home/recipes', {userId, error:"Erro ao carregar página!"})
        }
    },
    about(req,res){
        const userId = req.session.userId

        return res.render('home/about',{userId})
    },
    async showRecipe(req, res){
        const userId = req.session.userId
        try {
            const {recipe, files, chef} = await loadService.getRecipe(req.params.id)
            recipe.chef_name = chef.name

            return res.render('home/show',{recipe, files, userId})
            
        } catch (err) {
            console.error(err)
            return res.render('home/show', {userId, error:"Erro ao carregar página!"})
        }
    },
    async showChef(req,res){
        try {

            let {page, limit} = req.query
            const {chef, recipes, pagination, total_recipes, recipeFiles } = await loadService.getChefPaginate(req.params.id, page, limit)
    
            return res.render('home/chefShow',{chef, recipes, pagination, total_recipes, recipeFiles, userId: req.session.userId})
            
        } catch (err) {
            console.error(err)
        }
    },
    async chefs(req,res){
        const userId = req.session.userId
        try {
            const chefs = await Chef.findAll()
    
            const chefFilePromise = chefs.map(chef => loadService.getImage(chef.file_id))
            let files = await Promise.all(chefFilePromise)

            const totalrecipesPromise = chefs.map(chef => Chef.totalRecipesByChef(chef.id))
            let totalRecipes = await Promise.all(totalrecipesPromise)
            chefs.map((chef,index) => chef.totalRecipes = totalRecipes[index].total)

            return res.render('home/chefs', {chefs, files, userId})
            
        } catch (err) {
            console.error(err)
            return res.render('home/chefs', {userId, error:"Erro ao carregar página!"})
        }
    },
    async busca(req,res){
        const userId = req.session.userId

        try{
            let isBusca = 1 //bit para identificação se a req pro bd vem de filtro de busca ou não
            const {recipes, pagination, filter} = await loadService.getPaginate(req.query.filter, req.query.page, req.query.limit, isBusca, null, userId)
            


            //get recipe imgs
            const filePromises = recipes.map(recipe => loadService.getImages(recipe.id))
            const allFiles = await Promise.all(filePromises)
            const files = allFiles.map(file => file[0])


            return res.render('home/filter', {recipes, pagination, filter, files, userId})

        } catch (err) {
            console.error(err)
            return res.render('home/filter', {userId, error:"Erro ao carregar página!"})
        }

        //getting recipe imgs
        //array de promises para pegar imgs de receitas
        // const filePromises = recipes.map(recipe => File.getFilesByRecipe(recipe.id))
        // await Promise.all(filePromises).then((values) => {
 
        //     const files = values.map(file => ({...file[0]}))
        //     if(files){
        //         if(typeof files[0] !== 'undefined' && typeof files[0].id !== 'undefined'){
        //             const files2 = files.map(file => ({
        //                 ...file,
        //                 src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
        //             }))
        //             return res.render('home/filter', {recipes, pagination, filter, files: files2,userId})
        //         }
        //     }
        //     return res.render('home/filter', {recipes,pagination, filter, userId})
        // })
    }
}