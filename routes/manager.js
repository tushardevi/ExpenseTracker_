import Router from 'koa-router'

const router = new Router({ prefix: '/manager' })

/* import */
import Expenses from '../modules/expenses.js'
const dbName = 'website.db'

async function checkAuth(ctx, next) {
	console.log('secure router middleware')
	console.log(ctx.hbs)
	if(ctx.hbs.authorised_M !== true) return ctx.redirect('/login?msg=you need to log in&referrer=/secure')
	await next()
}


router.use(checkAuth)


router.get('/', async ctx => {
  console.log("YOOOO ADMIN")
  try{
    await ctx.render('index', ctx.hbs)
  }catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}
  
// 	//ctx.session.authorised = null
// 	const expenses = await new Expenses(dbName)

// 	try {
// 		/*retrieving all expenses of a member*/
// 		const records = await expenses.all(ctx.session.userid)
// 		// get the total amount spent
// 		const _total = await expenses.getTotal(ctx.session.userid)
// 		console.log('TOTAL IS: ')
// 		console.log(_total)
// 		// console.log("ALL")
// 		// console.log(records)
// 		ctx.hbs.records = records
// 		ctx.hbs.total = _total
// 		console.log( ctx.hbs.total )
// 		await ctx.render('secure', ctx.hbs)

// 	} catch(err) {
// 		console.log(err.message)
// 		ctx.hbs.error = err.message
// 		await ctx.render('error', ctx.hbs)
// 	}


})


export default router
