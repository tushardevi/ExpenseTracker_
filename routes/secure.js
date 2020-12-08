/** @routes Secure */

import Router from 'koa-router'
const router = new Router({ prefix: '/secure' })
import Expenses from '../modules/expenses.js'
const dbName = 'website.db'

/**
	 * Summary:
	 * This function checks for
	 * authentication
	 *
	 * Parameters:
	 * @param {Function} ctx middleware
	 * @param {Function} next middleware
	 *
	 * @returns (redirects member to home page if
	 * authentication is not valid.
	 */

async function checkAuth(ctx, next) {
	console.log('secure router middleware')
	console.log(ctx.hbs)
	if(ctx.hbs.authorisedMember !== true) return ctx.redirect('/login?msg=you need to log in&referrer=/secure')
	await next()
}


router.use(checkAuth)


/**
 * Summary :
 * Secure Home page (for members only).
 *
 * @name Secure-Home.
 * @route {GET} /secure
 */
router.get('/', async ctx => {

	const expenses = await new Expenses(dbName)

	try {

		//retrieving all expenses of a member
		const records = await expenses.all(ctx.session.userid)

		// get the total amount spent
		const _total = await expenses.getTotal(ctx.session.userid)

		ctx.hbs.records = records
		ctx.hbs.total = _total

		await ctx.render('secure', ctx.hbs)

	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}


})


/**
 * Summary :
 * Script to open up a page where the
 * member can see the details of the
 * expense clicked.
 *
 * @name ExpenseDetail.
 * @route {GET} /secure/details/:id
 */
router.get('/details/:id',async ctx => {

	const expenses = await new Expenses(dbName)
	try {
		console.log(`record: ${ctx.params.id}`)

		/*retrieving one expense*/
		ctx.hbs.expense = await expenses.getExpense(ctx.params.id)
		ctx.hbs.id = ctx.params.id

		await ctx.render('details',ctx.hbs)
	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}

})


/**
 * Summary :
 * opens up the add-expenses page
 *
 * @name AddExpense.
 * @route {GET} /secure/add-expenses
 */
router.get('/add-expenses',async ctx => {
	await ctx.render('add-expenses',ctx.hbs)
})


/**
 * Summary :
 * Script to retieve all the necessary data from the add-expense
 * page and add it to the expenses table.
 *
 * @name AddExpense Script
 * @route {POST} /add-expenses
 */
router.post('/add-expenses', async ctx => {
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

		ctx.request.body.userid = ctx.session.userid

		// call the functions in the module
		await expenses.checkDate(ctx.request.body)
		await expenses.AddExpense(ctx.request.body)


		console.log(ctx.hbs)

		ctx.redirect('/secure?msg=new expense added')

	} catch(err) {
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(err.message)
		console.log(ctx.hbs)
		await ctx.render('add-expenses', ctx.hbs)
	} finally {
		expenses.close()
	}
})

export default router
