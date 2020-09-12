const File = require('../models/File')

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

module.exports = { getImage, getImages }