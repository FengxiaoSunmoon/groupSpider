mongoose = require 'mongoose'
Schema = mongoose.Schema
ObjectId = Schema.Types.ObjectId;

ArticleSchema = Schema {
    href: String
    text: String
    content: []
    img: String
    cate: String
    meta: {
        createAt:{
            type:Date
            default:Date.now()
        }
        updateAt:{
            type:Date
            default:Date.now()
        }
    }
}
ArticleSchema.pre 'save',(next) ->
    if this.isNew
      this.meta.createAt = this.meta.updateAt = Date.now()
    else
      this.meta.updateAt = Date.now()
    next()
ArticleSchema.statics = {
    fetch: (cb) =>
      this
        .find({})
        .sort('num')
        .exec(cb)
}

Article = mongoose.model 'Article',ArticleSchema
module.exports = Article
