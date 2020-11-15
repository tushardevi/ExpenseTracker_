//YOOOOOOOOOOOOO
import Router from 'koa-router'

const router = new Router({ prefix: '/secure' })

/**/
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


router.get('/add-expenses',async ctx=>{
  
  await ctx.render('add-expenses',ctx.hbs)
})

export default router
