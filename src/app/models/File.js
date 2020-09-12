const db = require('../../config/db')
const Base = require('./Base')
const fs = require('fs')

Base.init({table: 'files'})

module.exports = {
    ...Base
}