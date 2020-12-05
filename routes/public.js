
import Router from 'koa-router'
import bodyParser from 'koa-body'

const router = new Router()
router.use(bodyParser({multipart: true}))

import Accounts from '../modules/accounts.js'
import Expenses from '../modules/expenses.js'
const dbName = 'website.db'


/**
 * The home page.
 *
 * @name Home Page
 * @route {GET} /
 */

router.get('/', async ctx => {
	//const accounts = await new Accounts(dbName)
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
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
/*gets the register page*/
router.get('/register', async ctx => {
	console.log(ctx.hbs)
	await ctx.render('register', ctx.hbs)
})


/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
/*route to retieve data from the texboxes in the "/register" page and add it to the database
* by using the object account*/
router.post('/register', async ctx => {

	const account = await new Accounts(dbName)
  const expenses = await new Expenses(dbName)

	try {

		if(ctx.request.files.avatar.name) {
			ctx.request.body.filePath = ctx.request.files.avatar.path
			ctx.request.body.fileName = ctx.request.files.avatar.name
			ctx.request.body.fileType = ctx.request.files.avatar.type
      await expenses.checkFileFormat(ctx.request.body)
		}

    
		// call the functions in the module
    
		await account.register(ctx.request.body)
		

    
		ctx.redirect('/?msg= Account Created!')


	} catch(err) {
		console.log('/register : ')
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('register', ctx.hbs)

	}


})


/*route to retieve username and password from the texboxes in the "/login" in page*/
/*also it checks if the user is a manager or not*
 * 
 * */
router.post('/login', async ctx => {

	// new object Accounts
	const account = await new Accounts(dbName)
	ctx.hbs.body = ctx.request.body
	let referrer = ''
	try {

		const body = ctx.request.body


		// function returns an object with 2 values: ID and isAdmin
		// (to check if the user is admin or not)
		const info = await account.login(body.user, body.pass)


		ctx.session.user = body.user
		ctx.session.userid = info['id']

		// give it a check and change authorised to true or false according to who is logged in
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


/*route to log out the system */
router.get('/logout', async ctx => {
	ctx.session.authorisedMember = null
	ctx.session.authorisedManager = null
	delete ctx.session.user
	delete ctx.session.userid

	ctx.redirect('/?msg=you are now logged out')
})

export default router
