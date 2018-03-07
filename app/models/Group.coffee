mongoose = require 'mongoose'
Schema = mongoose.Schema
ObjectId = Schema.Types.ObjectId;

GroupSchema = Schema {
    img: String
    imgLocal: String
    text: String
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
GroupSchema.pre 'save',(next) ->
    if this.isNew
      this.meta.createAt = this.meta.updateAt = Date.now()
    else
      this.meta.updateAt = Date.now()
    next()
GroupSchema.statics = {
    fetch: (cb) =>
      this
        .find({})
        .sort('num')
        .exec(cb)
}

Group = mongoose.model 'Group',GroupSchema
module.exports = Group
