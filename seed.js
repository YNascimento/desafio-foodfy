const User = require('./src/app/models/User')
const Recipe = require('./src/app/models/Recipe')
const Chef = require('./src/app/models/Chef')
const File = require('./src/app/models/File')
const Recipe_File = require('./src/app/models/Recipe_File')

const { hash } = require("bcryptjs")
const faker = require('faker')

let totalUsers = 5,
    totalChefs = 5,
    totalRecipes = 10,
    totalRecipeFiles = 5
    
async function createFiles(name, quantity, recipeId){
    let files = []

    if(recipeId){
        while(files.length < quantity){
            files.push({
                name: faker.image.image(),
                path: `public/img/${name}.png`,
                recipe_id: recipeId
            })
        }
    }
    else{
        while(files.length < quantity){
            files.push({
                name: faker.image.image(),
                path: `public/img/${name}.png`
            })
        }
    }

    const filesPromise = files.map(file => File.create(file))
    let results = await Promise.all(filesPromise)
    return results
}

async function fillRecipeFileTable(recipeId){
    
    const files = await File.findAll({where: {recipe_id: recipeId} })

    recipeFilePromise = files.map(file => Recipe_File.create({
        recipe_id: recipeId,
        file_id: file.id
    }))
    const recipeFilesIds = await Promise.all(recipeFilePromise)
}

async function createUsers(){
    const users = []
    const password = await hash('123',8)

    while(users.length < totalUsers){
        
        users.push({
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password,
            is_admin: Math.round(Math.random())
        })
    }

    const usersPromise = users.map(user => User.create(user))
    const usersIds = await Promise.all(usersPromise)
}

async function createChefs(){

    const filesIds = await createFiles('chef', totalChefs)
    const chefs =[]
    while(chefs.length < totalChefs){
        
        chefs.push({
            name: faker.name.firstName(),
            file_id: filesIds[chefs.length]
        })
    }

    const chefsPromise = chefs.map(chef => Chef.create(chef))
    chefsIds = await Promise.all(chefsPromise)
}

async function createRecipes(){

    const recipes =[]

    //generates recipes
    while(recipes.length < totalRecipes){
        
        let ingredients = []

        recipes.push({
            chef_id: Math.ceil(Math.random() * totalChefs),
            title: faker.commerce.product(),
            ingredients:`{"${faker.lorem.paragraph(1)}", "${faker.lorem.paragraph(1)}"}`,
            preparation:`{"${faker.lorem.paragraph(1)}", "${faker.lorem.paragraph(1)}"}`,
            information: faker.lorem.paragraph(Math.ceil(Math.random())*5),
            user_id: Math.ceil(Math.random() * totalUsers)
        })
    }

    //create Recipes
    const recipesPromise = recipes.map(recipe => Recipe.create(recipe))
    recipesIds = await Promise.all(recipesPromise)

    //create recipes' files
    const filePromise = recipesIds.map(recipeId => createFiles('recipe', Math.ceil(Math.random() * totalRecipeFiles), recipeId))
    recipeFiles = await Promise.all(filePromise)

    //fill recipe_files table
    const recipeFileTablePromise = recipesIds.map(recipeId => fillRecipeFileTable(recipeId))
    const recipeFileTable = await Promise.all(recipeFileTablePromise)
}

async function init(){
    await createUsers()
    await createChefs()
    await createRecipes()
}

init()