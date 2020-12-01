
import Router from 'koa-router'
import bodyParser from 'koa-body'

const router = new Router()
router.use(bodyParser({multipart: true}))

import Accounts from '../modules/accounts.js'
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

		if(ctx.hbs.authorised) {
			return ctx.redirect('/secure')
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
	try {
		// call the functions in the module
		await account.register(ctx.request.body.user, ctx.request.body.pass, ctx.request.body.email)
		console.log(ctx.hbs)
		ctx.redirect(`/?msg=new user "${ctx.request.body.user}" added, you need to log in`)

	} catch(err) {
    console.log("/register : ")
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('register', ctx.hbs)
	} finally {
		account.close()
	}
})

// router.get('/login', async ctx => {
// 	console.log(ctx.hbs)
// 	await ctx.render('login', ctx.hbs)
// })


/*route to retieve username and password from the texboxes in the "/login" in page*/
router.post('/login', async ctx => {
	const account = await new Accounts(dbName)

	ctx.hbs.body = ctx.request.body
  
  let referrer = ''
  
  
	try {
    
    console.log("CR777")
		const body = ctx.request.body
		const info = await account.login(body.user, body.pass)
   
    console.log("ID")
    
    
    

    ctx.session.user = body.user
    ctx.session.userid = info['id']


    if(info['isAdmin'] < 0 ){
    ctx.session.authorised = null
    ctx.session.authorised_M = true
    referrer = body.referrer || '/manager'

      
    }
    
    if(info['isAdmin'] >= 0){
      
       ctx.session.authorised_M = null
       ctx.session.authorised = true
     

       referrer = body.referrer || '/secure'


    }

    
    
   	return ctx.redirect(`${referrer}?msg= Welcome ${body.user}`)
    
    
	} catch(err) {
    console.log(err.message)
		ctx.hbs.msg = err.message
		await ctx.render('index', ctx.hbs)
	} finally {
		account.close()
	}
  
  
  
  
  
  
  
})


/*route to log out the system */
router.get('/logout', async ctx => {
	ctx.session.authorised = null
  ctx.session.authorised_M = null
	delete ctx.session.user
	delete ctx.session.userid
  
	ctx.redirect('/?msg=you are now logged out')
})

export default router
