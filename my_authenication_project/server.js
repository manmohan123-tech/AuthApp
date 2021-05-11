const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./model/user')
const UserDetails =require("./model/userdetails")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'

 mongoose.connect('mongodb://localhost:27017/login-app-db', {
 	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
})


const app = express()
app.use('/', express.static(path.join(__dirname, 'static')))
app.use(bodyParser.json())
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'static'));



// code for login 

app.post('/api/login', async (req, res) => {
	const { username, password } = req.body
	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},
			JWT_SECRET
		)

	return res.json({ status: 'ok', data:{token : token,email:user.email},redirect_path: "/fullNamedetail" })

	}

	res.json({ status: 'error', error: 'Invalid username/password' })
})

app.get('/login', (req, res) => res.render('login.html'))
app.get('/register', (req, res) => res.render('index.html'))
app.get('/fullNamedetail', (req, res) => res.render('que.html'))


// Code  for Signup for new user.

app.post('/api/register', async (req, res) => {
	const { username, email, password: plainTextPassword } = req.body

	console.log("req.body : ", req.body);

	if (!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Invalid username' })
	}
	if (!email || typeof email !== 'string') {
		return res.json({ status: 'error', error: 'Invalid email' })
	}

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

	const password = await bcrypt.hash(plainTextPassword, 10);

	try {
		const response = await User.create({username,email,password});
		const details = await UserDetails.create({email : email});
		console.log('User created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Credentials already in use' })
		}
		throw error
	}

	res.json({ status: 'ok' })
})


// Code for enter the additional details of user

app.post('/api/fullNameDetail', async (req, res) => {
    
	const { fullName,food,movie,age,email} = req.body;
	// console.log(name,food,movie,age);

    if (!fullName || typeof fullName !== 'string') {

        return res.json({ status: 'error', error: 'Invalid Name'})
		
    }
	if(!food || typeof food!=='string')
	{
		return res.json({status:'error',error:'Invalid Food'});
	}
 
	if (!movie || typeof movie !== 'string') {
        return res.json({ status: 'error', error: 'Invalid Movie'})
    }
	if(!age || typeof age!=='string')
	{
		return res.json({status:'error',error:'Invalid Age'});
	}

    try {
		const response = await UserDetails.findOneAndUpdate(
			{email :email },
			{
				fullName:fullName,
				food:food,
				movie:movie,
				age:parseInt(age)
			}
			);
        console.log('Recorded succesfully', response);
		return res.json({ status: 'ok' });
    } catch (error) {
        throw error;
    }  
})

app.get('/dashboard',async(req,res)=>{
	res.render('dashboard.html');
})

app.listen(9999, () => {
	console.log('Server up at 9999')
})
