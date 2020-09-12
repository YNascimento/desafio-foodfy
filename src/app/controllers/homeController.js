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
                recipe.name = chefs[index].name
            })

            console.log('home controller - chef name', recipes)
    
            const filePromises = recipes.map(recipe => {loadService.getImages(recipe.id)})
            const files = await Promise.all(filePromises)
    
            return res.render('home/index', {recipes, chefs, files, userId})
            
        } catch (err) {
            console.error(err)
            return res.render('home/index', {userId, error:"Erro ao carregar página!"})
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
        //             return res.render('home/index', {recipes, chefs, files: files2,userId})
        //         }
        //     }
        //     return res.render('home/index', {recipes, userId})
        // })

    },
    async recipes(req,res){

        const userId = req.session.userId

        try {
            //pagination prep
            let {filter, page, limit} = req.query
            let isBusca = 0 //bit para identificação se a req pro bd vem de filtro de busca ou não
            
            const {pagination, filter} = loadService.paginate(filter, page, limit, isBusca, null, userId)
    
            //get recipe imgs
            const filePromises = recipes.map(recipe => {loadService.getImages(recipe.id)})
            const files = await Promise.all(filePromises)
    
            return res.render('home/recipes', {recipes, pagination, filter, files, userId})
            
        } catch (err) {
            console.error(err)
            return res.render('home/recipes', {userId, error:"Erro ao carregar página!"})
        }

        
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
        //             return res.render('home/recipes', {recipes, pagination, filter, files: files2, userId})
        //         }
        //     }
        //     return res.render('home/recipes', {recipes,pagination, filter, userId})
        // })

    },
    about(req,res){
        const userId = req.session.userId

        return res.render('home/about',{userId})
    },
    async show(req, res){
        const userId = req.session.userId
        try {
            let results = loadService.getRecipe(req.params.id)
            const {recipe, files} = results
    
            return res.render('home/show',{recipe, files, userId})
            
        } catch (err) {
            console.error(err)
            return res.render('home/show', {userId, error:"Erro ao carregar página!"})
        }
    },
    async chefs(req,res){
        const userId = req.session.userId
        try {
            const chefs = await Chef.findAll()
    
            const chefFilePromise = chefs.map(chef => File.find(chef.file_id))
            const files = await Promise.all(chefFilePromise)
    
            return res.render('home/chefs', {chefs, files, userId})
            
        } catch (err) {
            console.error(err)
            return res.render('home/chefs', {userId, error:"Erro ao carregar página!"})
        }
    },
    async busca(req,res){
        const userId = req.session.userId

        try{
            let {filter, page, limit} = req.query
            let isBusca = 1 //bit para identificação se a req pro bd vem de filtro de busca ou não

            const {pagination, filter} = loadService.paginate(filter, page, limit, isBusca, null, userId)
            
            //get recipe imgs
            const filePromises = recipes.map(recipe => {loadService.getImages(recipe.id)})
            const files = await Promise.all(filePromises)

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