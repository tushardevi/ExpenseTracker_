import Router from 'koa-router'

const router = new Router({ prefix: '/secure' })

/* import */
import Expenses from '../modules/expenses.js'
const dbName = 'website.db'

async function checkAuth(ctx, next) {
	console.log('secure router middleware')
	console.log(ctx.hbs)
	if(ctx.hbs.authorised !== true) return ctx.redirect('/login?msg=you need to log in&referrer=/secure')
	await next()
}


router.use(checkAuth)


router.get('/', async ctx => {
	//ctx.session.authorised = null
	const expenses = await new Expenses(dbName)
	try {
		const records = await expenses.all(ctx.session.userid)
		ctx.hbs.records = records
		await ctx.render('secure', ctx.hbs)
	} catch(err) {
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}
})


/*opens up the add-expenses page*/
router.get('/add-expenses',async ctx => {

	await ctx.render('add-expenses',ctx.hbs)
})


/*this post method will retieve all the necessary data from the add-expense
 * page and add it to the expenses table in website.db*/
router.post('/add-expenses', async ctx => {
	const expenses2 = await new Expenses(dbName)
	try {
    
     if(ctx.request.files.avatar.name){
        ctx.request.body.filePath = ctx.request.files.avatar.path
        ctx.request.body.fileName = ctx.request.files.avatar.name
        ctx.request.body.fileType = ctx.request.files.avatar.type
     }
      
    
    
		// call the functions in the module
		ctx.request.body.userid = ctx.session.userid
		await expenses2.AddExpense(ctx.request.body)
		console.log(ctx.hbs)
		ctx.redirect('/secure?msg=new expense added')

	} catch(err) {
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('add-expenses', ctx.hbs)
	} finally {
		expenses2.close()
	}
})


export default router
