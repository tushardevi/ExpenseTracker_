/** @routes Manager */
import Router from 'koa-router'

const router = new Router({ prefix: '/manager' })

import Email from '../modules/sendEmail.js'
import Accounts from '../modules/accounts.js'
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

async function checkAuth2(ctx, next) {
	console.log('manager router middleware')
	console.log(ctx.hbs)
	if(ctx.hbs.authorisedManager !== true) return ctx.redirect('/login?msg=you need to log in&referrer=/manager')
	await next()
}


router.use(checkAuth2)


/**
 * Summary :
 * Manager Home page (for managers only).
 *
 * @name Manager Home.
 * @route {GET} /manager
 */
router.get('/', async ctx => {
	const users = await new Accounts(dbName)
	const expenses = await new Expenses(dbName)

	try {

		//retrieving all expenses of a member
		const records = await users.allUsers()

		const total = await expenses.getApprovedTotal()
		ctx.hbs.total_ = total
		ctx.hbs.records = records
		console.log(records)
		await ctx.render('managerIndex', ctx.hbs)

	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}


})

/**
 * Summary :
 * Script to open up a page where the
 * manager can see all expenses of that user
 * (different for each user id).
 *
 * @name allExpenses.
 * @route {GET} /manager/allExpenses/:id
 */

router.get('/allExpenses/:id',async ctx => {

	const users = await new Accounts(dbName)

	const expenses = await new Expenses(dbName)
	try {
		console.log(`userid is : ${ctx.params.id}`)

		//retrieving all expenses
		const records = await expenses.all(ctx.params.id)
		ctx.hbs.records = records

		//getting the total
		const _total = await expenses.getTotal(ctx.params.id)
		ctx.hbs.total = _total

		//getting the user's details who incurred the expense
		const userInfo = await users.getUser(ctx.params.id)
		ctx.hbs.user = userInfo


		await ctx.render('allExpenses',ctx.hbs)
	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}

})


/**
 * Summary :
 * Script to open up the details page
 * of just one expense.
 *  (different for each expense id).
 *
 * @name ExpenseDetails.
 * @route {GET} /manager/allExpenses/expense/:exp_id
 */

router.get('/allExpenses/expense/:exp_id',async ctx => {

	const expenses = await new Expenses(dbName)
	try {

		console.log(`record: ${ctx.params.exp_id}`)

		/*retrieving one expense*/
		const expense = await expenses.getExpense(ctx.params.exp_id)
		ctx.hbs.expense = expense
		ctx.hbs.id = ctx.params.exp_id

		await ctx.render('detailsM',ctx.hbs)

	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}

})


/**
 * Summary :
 * Script to approve an expense.
 *
 * @name Approved.
 * @route {GET} /manager/approved/:expe_id
 */
router.get('/approved/:expe_id', async ctx => {

	const expenses = await new Expenses(dbName)
	const users = await new Accounts(dbName)
	const email = await new Email()

	try {

		console.log(`Record: ${ctx.params.expe_id}`)

		//retrieving details of just one expense and the email address of user
		const expense = await expenses.getExpense(ctx.params.expe_id)
		const userInfo = await users.getUser(expense.userid)
		const userEmail = userInfo.email

		await expenses.approve(ctx.params.expe_id)
		await email.sendEmail(userEmail,expense.expense_id,expense.amount)

		ctx.redirect(`/manager/allExpenses/${expense.userid}?msg=Expense Approved`)
	} catch(err) {
		console.log(err.message)
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}

})


export default router
