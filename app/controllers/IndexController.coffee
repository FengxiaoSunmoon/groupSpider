config = require '../../config/config.coffee'
spider = require '../../util/spiderStart'
Art = require '../models/Article.coffee'
Group = require '../models/Group.coffee'

exports.index = (req,res) ->
  res.render 'index/index', {
      title: 'puppeteer爬虫'
      css: 'index.css'
    }
spiderFlag = true
exports.spider = (req,res) ->
  #判断是否已经在爬，true代表可以运行爬虫
  if spiderFlag
    res.json({ok:true})
    spiderFlag = false;
    spider(() -> spiderFlag = true)
  else
    res.json({ok:false})
    console.log '程序还在运行，请稍候再试...'
exports.getCate = (req,res) ->
  Cate.findOne {}, (err,cates) ->
    res.send cates.c
exports.getArtList = (req,res) ->
  if req.body.cate
    Art.find({cate:req.body.cate})
      .sort('-1')
      .limit(20)
      .exec (err,arts) =>
        res.send arts
  else
    Art.find({})
      .sort('-1')
      .limit(20)
      .exec (err,arts) =>
        res.send arts
exports.details = (req,res) ->
  Art.findOne {_id:req.query.id},(err,art) ->
    res.send art
exports.null = (req,res) ->
  res.render 'includes/404', {
      title: 'No Found'
    }
