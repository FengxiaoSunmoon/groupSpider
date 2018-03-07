Index = require '../app/controllers/IndexController.coffee'
multipart = require 'connect-multiparty';
multipart()
module.exports = (app) =>
    app.get '/', Index.index
    app.post '/spider', Index.spider
    app.post '/getCate', Index.getCate
    app.post '/getArtList', Index.getArtList
    app.post '/details', Index.details
    app.get '*', Index.null
