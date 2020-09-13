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
            const {filter, page, limit, byUser} = req.query
            let isBusca = 0 //bit para identificação se a req pro bd vem de filtro de busca ou não            

            const {recipes, pagination, filterReturn} = await loadService.getPaginate(filter, page, limit, isBusca, byUser, userId)
    
            //get recipe imgs
            const filePromises = recipes.map(recipe => loadService.getImages(recipe.id))
            const allFiles = await Promise.all(filePromises)
            const files = allFiles.map(file => file[0])
    
            return res.render('home/recipes', {recipes, pagination, filter: filterReturn, files, userId})
            
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

            return res.render('home/recipeShow',{recipe, files, userId})
            
        } catch (err) {
            console.error(err)
            return res.render('home/recipeShow', {userId, error:"Erro ao carregar página!"})
        }
    },
    async showChef(req,res){
        try {

            let {page, limit} = req.query
            const {chef, recipes, pagination, totalRecipes, recipeFiles } = await loadService.getChefPaginate(req.params.id, page, limit)
    
            return res.render('home/chefShow',{chef, recipes, pagination, totalRecipes, recipeFiles, userId: req.session.userId})
            
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
    }
}