import Router from 'koa-router'

const router = new Router({ prefix: '/manager' })

/* import */
import Expenses from '../modules/managers.js'
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
	const expenses = await new Expenses(dbName)


	try {
		/*retrieving all expenses of a member*/
		const records = await expenses.all(ctx.session.userid)
		ctx.hbs.records = records

		await ctx.render('secure', ctx.hbs)

	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}


})


export default router
