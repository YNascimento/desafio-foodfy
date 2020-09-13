const File = require('../models/File')
const Recipe = require('../models/Recipe')
const Chef = require('../models/Chef')

async function getImage(fileId){

    let results = await File.find(fileId)

    const file = {
        ...results,
        src: `${results.path.replace('public','')}`
    }

    return file
}

async function getImages(recipeId){
    let results = await File.findAll({where: {recipe_id: recipeId} })

    let files = results.map(file => ({
        ...file,
        src: `${file.path.replace('public','')}`
    }))

    return files
}

async function getRecipe(id){

    const recipe = await Recipe.find(id)
    const files = await getImages(recipe.id)
    const chef = await Chef.find(recipe.chef_id)
    recipe.chef_name = chef.name
    
    return {recipe, files, chef}
}

async function getPaginate(filter, page, limit, isBusca, byUser, userId){

    page = page || 1
    limit = limit || 6

    let offset = limit*(page-1)
    const params = { filter, page, limit, offset, isBusca, byUser, userId }
    
    //get recipes
    const recipes = await Recipe.paginate(params)
    
    const pagination = {
        total:  recipes[0] != null ? Math.ceil(recipes[0].total/limit) : 0, //total pages
        page
    }
    return {recipes, pagination, filter}
}

async function getChefPaginate(id, page, limit){
    
    const chef = await Chef.find(id) 
    if(!chef) res.send("Chef not found")

    //pagination prep
    page = page || 1
    limit = limit || 4

    let offset = limit*(page-1)
    const params = {page, limit, offset }

    const recipes = await Chef.recipesBy(chef.id, params) //recipes with pagination
    recipes.map(recipe => recipe.chef_name = chef.name)

    const totalRecipes = await Chef.totalRecipesByChef(chef.id)

    const pagination = {
        total:  recipes[0] != null ? Math.ceil(recipes[0].total/limit) : 0, //total pages
        page
    }

    //get chef img
    chef.file = await File.find(chef.file_id)
    chef.file.src = `${chef.file.path.replace('public','')}`

    //get imgs to all chef's recipes
    const allRecipeFilesPromises = recipes.map(recipe => getImages(recipe.id))
    const allRecipeFiles = await Promise.all(allRecipeFilesPromises)
    const recipeFiles = allRecipeFiles.map(file => file[0])

    return {chef, recipes, pagination, totalRecipes, recipeFiles}
}

module.exports = { getImage, getImages, getRecipe, getPaginate, getChefPaginate }