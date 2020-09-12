const File = require('../models/File')
const Recipe = require('../models/Recipe')

async function getImage(fileId){
    let results = await File.find({where: {id: fileId} })
    const file = {
        ...results,
        src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
    }
    return file
}

async function getImages(recipeId){
    let results = await File.findAll({where: {recipe_id: recipeId} })

    let files = results.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
    }))

    return files
}

async function getRecipe(id){

    const recipe = await Recipe.find(id)

    if(!recipe) {
        console.error('Recipe not found!')
        return res.send('Recipe not found')
    }

    const files = getImages(recipe.id)

    return {recipe, files}
}

async function getPaginate(filter, page, limit, isBusca){

    page = page || 1
    limit = limit || 3

    let offset = limit*(page-1)
    const params = { filter, page, limit, offset, isBusca }
    
    //get recipes
    const recipes = await Recipe.paginate(params)
    
    const pagination = {
        total: Math.ceil(recipes[0].total/limit), //total pages
        page
    }
    return {pagination, filter}
}
module.exports = { getImage, getImages, getRecipe, getPaginate }