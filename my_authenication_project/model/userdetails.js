const mongoose = require('mongoose')

const UserDetailsSchema = new mongoose.Schema(
	{
		fullName: { type: String},
		food:{type:String},
		movie:{type:String},
		age : {type:String},
		email : {type:String,required:true},
	},
	{ collection: 'userdetails' }
)

const model = mongoose.model('UserDetails', UserDetailsSchema)
module.exports = model
