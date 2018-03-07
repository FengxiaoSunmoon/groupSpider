require 'coffee-script/register'
#coffee -w -c test.coffee
express = require 'express'
path = require 'path'
mongoose = require 'mongoose'
//dbUrl = 'mongodb://clc:Clcdata8803@localhost/expressSpider'
dbUrl = 'mongodb://localhost/groupSpider'
mongoose.Promise = require 'bluebird'
mongoose.connect dbUrl

app = express()
app.set 'views','./app/views'
app.set 'view engine','pug'
app.set 'view options', { pretty: true };
app.use express.static path.join __dirname,'./src'
bodyParser = require 'body-parser'
app.use bodyParser.json()
app.use bodyParser.urlencoded { extended: true }

routes = require './config/routes.coffee'
routes app
#本地
port = process.env.PORT || 8080
http = require 'http';
server = http.createServer(app).listen port, '0.0.0.0';
console.log 'http service start on port ' + port
#服务器
#port = process.env.PORT || 443
#https = require 'https';
#fs = require 'fs';
#options = {
#    key: fs.readFileSync('./ssl/214197784430300.key')
#    cert: fs.readFileSync('./ssl/214197784430300.pem')
#}
#server = https.createServer(options,app).listen port,'0.0.0.0'
#console.log 'https service start on port ' + port

#载入socket服务
socket = require './util/socketServer.js'
socket server
