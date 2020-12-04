import Router from 'koa-router'

const router = new Router({ prefix: '/manager' })

/* import */
import Expenses from '../modules/managers.js'
import Expenses2 from '../modules/expenses.js'
const dbName = 'website.db'

async function checkAuth2(ctx, next) {
	console.log('manager router middleware')
	console.log(ctx.hbs)
	if(ctx.hbs.authorisedManager !== true) return ctx.redirect('/login?msg=you need to log in&referrer=/manager')
	await next()
}


router.use(checkAuth2)


router.get('/', async ctx => {
	//ctx.session.authorised = null
	const users = await new Expenses(dbName)
  const expenses = await new Expenses2(dbName)


	try {
   
		/*retrieving all expenses of a member*/
		let records = await users.allUsers()
    
    console.log("BROOOOV")
    console.log(records)
		ctx.hbs.records = records

		await ctx.render('managerIndex', ctx.hbs)

	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}


})



/*opens up the details page (different for each expense)*/
router.get('/allExpenses/:id',async ctx => {
  
  const users = await new Expenses(dbName)
  
	const expenses = await new Expenses2(dbName)
	try {
		console.log(`userid is : ${ctx.params.id}`)
    
		/*retrieving one expense*/
    const records = await expenses.all(ctx.params.id)
    ctx.hbs.records = records
  
    const _total = await expenses.getTotal(ctx.params.id)
    ctx.hbs.total = _total
    
    const userInfo = await users.getUser(ctx.params.id)
    ctx.hbs.user = userInfo
 

		await ctx.render('allExpenses',ctx.hbs)
	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}

})

/*opens up the details page (different for each expense)*/
router.get('/allExpenses/expense/:exp_id',async ctx => {
  
  const users = await new Expenses(dbName)
  
	const expenses = await new Expenses2(dbName)
	try {
	
    console.log(`record: ${ctx.params.exp_id}`)

		/*retrieving one expense*/
   const  expense = await expenses.getExpense(ctx.params.exp_id)
		ctx.hbs.expense = expense
		ctx.hbs.id = ctx.params.exp_id

		await ctx.render('detailsM',ctx.hbs)
    
	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}

})



export default router
