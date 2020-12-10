/** @routes Public */

import Router from 'koa-router'
import bodyParser from 'koa-body'

const router = new Router()
router.use(bodyParser({multipart: true}))

import Accounts from '../modules/accounts.js'
import Expenses from '../modules/expenses.js'
const dbName = 'website.db'


/**
 * Summary:
 * The home page.
 *
 * @name Home Page
 * @route {GET}
 *
 */
router.get('/', async ctx => {

	try {

		if(ctx.hbs.authorisedMember) {
			return ctx.redirect('/secure')
		}
		if(ctx.hbs.authorisedManager) {
			return ctx.redirect('/manager')
		}


		await ctx.render('index', ctx.hbs)

	} catch(err) {
		await ctx.render('error', ctx.hbs)
	}
})


/**
 * Summary :
 * User registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => {
	console.log(ctx.hbs)
	await ctx.render('register', ctx.hbs)
})


/**
 * Summary :
 * Script to retieve data from the texboxes in the "/register"
 * page and add it to the database.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', async ctx => {

	const account = await new Accounts(dbName)
	const expenses = await new Expenses(dbName)

	try {
		// if user uploaded a file then get additional file info
		//and check if the format is valid.
		if(ctx.request.files.avatar.name) {
			ctx.request.body.filePath = ctx.request.files.avatar.path
			ctx.request.body.fileName = ctx.request.files.avatar.name
			ctx.request.body.fileType = ctx.request.files.avatar.type
			await expenses.checkFileFormat(ctx.request.body)
		}


		// register the member.
		await account.register(ctx.request.body)


		ctx.redirect('/?msg= Account Created!')

	} catch(err) {
		ctx.hbs.msg = err.message
		console.log(err.message)
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('register', ctx.hbs)

	}


})


/**
 * Summary :
 * Script to retieve username and password from the
 * texboxes in the "/login" page,
 * also checks if the user is a manager or not.
 *
 * @name Login Script
 * @route {POST} /login

 */
router.post('/login', async ctx => {

	// new object Accounts
	const account = await new Accounts(dbName)
	ctx.hbs.body = ctx.request.body
	let referrer = ''
	try {

		const body = ctx.request.body

		// function returns an dictionary with 2 values: ID and isAdmin
		const info = await account.login(body.user, body.pass)

		ctx.session.user = body.user
		ctx.session.userid = info['id']

		// give it a check and change authorised to true or false
		// according to who logged in

		if(info['isAdmin'] < 0 ) {
			ctx.session.authorisedMember = null
			ctx.session.authorisedManager = true
			referrer = body.referrer || '/manager'

		}

		if(info['isAdmin'] >= 0) {

			ctx.session.authorisedManager = null
			ctx.session.authorisedMember = true
			referrer = body.referrer || '/secure'

		}

		// redirect to an appropiate route
   	return ctx.redirect(`${referrer}?msg= Welcome ${body.user}`)


	} catch(err) {
		ctx.hbs.msg = err.message
		await ctx.render('index', ctx.hbs)
	} finally {
		account.close()
	}


})


/**
 * Summary :
 * Script to log out the system.
 *
 * @name Logout Script
 * @route {GET} /logout
 */
router.get('/logout', async ctx => {
	ctx.session.authorisedMember = null
	ctx.session.authorisedManager = null
	delete ctx.session.user
	delete ctx.session.userid

	ctx.redirect('/')
})

export default router
