mongoose = require 'mongoose'
Schema = mongoose.Schema
ObjectId = Schema.Types.ObjectId;

JjcontentSchema = Schema {
    text: String
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
JjcontentSchema.pre 'save',(next) ->
    if this.isNew
      this.meta.createAt = this.meta.updateAt = Date.now()
    else
      this.meta.updateAt = Date.now()
    next()
JjcontentSchema.statics = {
    fetch: (cb) =>
      this
        .find({})
        .sort('num')
        .exec(cb)
}

Jjcontent = mongoose.model 'Jjcontent',JjcontentSchema
module.exports = Jjcontent
