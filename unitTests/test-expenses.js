
import test from 'ava'
import Expenses from '../modules/expenses.js'


/**
 * Missing fields checks
 */
test('ADD EXPENSE  : missing date', async test => {
	test.plan(1)

	const expenses = await new Expenses()
	const data = {date: '' ,label: 'party' , category: 'Food',
		descrip: 'meeting', amount: 394, userid: 3}


	try {
		await expenses.AddExpense(data)
		test.fail('expense added without a date, test failed!')

	} catch(err) {

		test.is(err.message, 'missing fields', 'incorrect error message')
	} finally {
		expenses.close()
	}
})

test('ADD EXPENSE  : missing label', async test => {
	test.plan(1)

	const expenses = await new Expenses()
	const data = {date: '2020-02-12' ,label: '' , category: 'Food',
		descrip: 'meeting', amount: 394, userid: 3}


	try {
		await expenses.AddExpense(data)
		test.fail('expense added without a label, test failed!')

	} catch(err) {

		test.is(err.message, 'missing fields', 'incorrect error message')
	} finally {
		expenses.close()
	}
})

test('ADD EXPENSE  : missing description', async test => {
	test.plan(1)

	const expenses = await new Expenses()
	const data = {date: '2020-02-12' ,label: 'party' , category: 'Food',
		descrip: '', amount: 394, userid: 3}


	try {
		await expenses.AddExpense(data)
		test.fail('expense added without a description, test failed!')

	} catch(err) {

		test.is(err.message, 'missing fields', 'incorrect error message')
	} finally {
		expenses.close()
	}
})

test('ADD EXPENSE  : missing amount', async test => {
	test.plan(1)

	const expenses = await new Expenses()
	const data = {date: '2020-02-12' ,label: 'party' , category: 'Food',
		descrip: 'meeting', amount: '', userid: 3}


	try {
		await expenses.AddExpense(data)
		test.fail('expense added without an amount, test failed!')

	} catch(err) {

		test.is(err.message, 'missing fields', 'incorrect error message')
	} finally {
		expenses.close()
	}
})

test('ADD EXPENSE  : missing image', async test => {
	test.plan(1)

	const expenses = await new Expenses()
	const data = {date: '2020-02-12' ,label: 'party' , category: 'Food',
		descrip: 'meeting', amount: 199, userid: 3}


	try {
		await expenses.AddExpense(data)
		test.pass('image upload error')

	} catch(err) {

		test.fail('throw err')
	} finally {
		expenses.close()
	}
})


/**
 * Data type check
 */

test('ADD EXPENSE  : check for integer when entering amount', async test => {
	test.plan(1)

	const expenses = await new Expenses()
	const data = {date: '2020-02-12' ,label: 'party' , category: 'Food',
		descrip: 'meeting', amount: 'hi', userid: 3}


	try {
		await expenses.AddExpense(data)
		test.fail('expense added where amount is not integer, test failed!')

	} catch(err) {

		test.pass('throw err')
	} finally {
		expenses.close()
	}
})

/**
 * File format check
 */
test('ADD EXPENSE  : error if invalid file format', async test => {
	test.plan(1)

	const expenses = await new Expenses()
	const data = {fileType: 'application/document'}


	try {
		await expenses.checkFileFormat(data)
		test.fail('invalid file type added to the system, test failed!')

	} catch(err) {

		test.is(err.message,'Invalid file format','incorrect meesage')
	} finally {
		expenses.close()
	}
})


/**
 * Date check
 */

test('ADD EXPENSE  : error if invalid date', async test => {
	test.plan(1)

	const expenses = await new Expenses()
	const data = {date: '2021-02-12' ,label: 'party' , category: 'Food',
		descrip: 'meeting', amount: 99, userid: 3}


	try {
		await expenses.checkDate(data)
		test.fail('expense added with an invalid date, test failed!')

	} catch(err) {

		test.is(err.message, 'Date must be less or equal to todays date', 'incorrect error message')
	} finally {
		expenses.close()
	}
})


/**
 * Database Checks
 * */

test('ADD EXPENSE    : storing expense to DB', async test => {
	test.plan(1)


	const expenses = await new Expenses()
	const data = {date: '02/12/2020' ,label: 'associates' , category: 'Food',
		descrip: 'meeting', amount: 394, userid: 3}

	try {
		const expense = await expenses.AddExpense(data)

		test.is(expense, true, 'cannot add expense')

	} catch(err) {
		console.log(err.message)
		test.fail('error thrown')

	} finally {
		expenses.close()
	}
})


test('GET EXPENSES  : check if expenses are correctly retrieved', async test => {
	test.plan(1)

	// add new expenses
	const expenses = await new Expenses()
	const details = {date: '2020-12-02' ,label: 'associates' , category: 'Food',
		descrip: 'meeting', amount: 394, userid: 1}

	const details2 = {date: '2020-10-14' ,label: 'Party' , category: 'Travel',
		descrip: 'hotel', amount: 100, userid: 1}

	try {
		await expenses.AddExpense(details)
		await expenses.AddExpense(details2)
		//retrieve expenses
		 const allExpenses = await expenses.all(details.userid)
		const size = allExpenses.length

		 test.not(size, 0, 'cannot show expense')

	} catch(err) {
		console.log(err.message)
		test.fail('cannot retrieve expenses')

	} finally {
		expenses.close()
	}
})

test('GET EXPENSE  : check if one expense is correctly retrieved', async test => {
	test.plan(1)

	// add new expenses
	const expenses = await new Expenses()
	const details = {date: '2020-12-02' ,label: 'associates' , category: 'Food',
		descrip: 'meeting', amount: 394, userid: 1}

	try {
		await expenses.AddExpense(details)

		//retrieve the expense with id = 1. the expense_id attribute automatically increments.
		//"details" is the first expense added,so it will have an expense_id of 1
		 const Expense = await expenses.getExpense(1)
		const label = Expense.label

		 test.is(label, 'associates', 'cannot show expense')

	} catch(err) {
		console.log(err.message)
		test.fail('cannot retrieve expense')

	} finally {
		expenses.close()
	}
})


/**
 * Logic Check
 */

test('GET TOTAL  : check if gets the correct total', async test => {
	test.plan(1)

	// add new expenses
	const expenses = await new Expenses()
	const details = {date: '2020-12-02' ,label: 'associates' , category: 'Food',
		descrip: 'meeting', amount: 394, userid: 1}

	const details2 = {date: '2020-10-14' ,label: 'Party' , category: 'Travel',
		descrip: 'hotel', amount: 100, userid: 1}


	try {
		await expenses.AddExpense(details)
		await expenses.AddExpense(details2)

		//retrieve expenses
		 const total = await expenses.getTotal(details.userid)

		// right answer : 394 + 100 = 494
		 test.is(total, 494, 'incorrect total')

	} catch(err) {
		console.log(err.message)
		test.fail('cannot show total')

	} finally {
		expenses.close()
	}
})


test('APPROVE EXPENSE  : check if expense is approved', async test => {
	test.plan(1)

	// add new expense
	const expenses = await new Expenses()
	const expense1 = {date: '2020-12-02' ,label: 'associates' , category: 'Food',
		descrip: 'meeting', amount: 394, userid: 1}

	try {
		await expenses.AddExpense(expense1)

		//approve the expense with expense_id = 1. the expense_id attribute automatically increments.
		//"expense1" is the first expense added,so it will have an expense_id of 1
		 const approved = await expenses.approve(1)

		 test.is(approved, true, 'cannot approve expense')

	} catch(err) {
		console.log(err.message)
		test.fail('Error in approving expense, test failed!')

	} finally {
		expenses.close()
	}
})

test('GET APPROVED TOTAL  : check if gets the correct total of all approved expenses', async test => {
	test.plan(1)

	// add new expenses
	const expenses = await new Expenses()
	const details = {date: '2020-12-02' ,label: 'associates' , category: 'Food',
		descrip: 'meeting', amount: 394, userid: 1}

	const details2 = {date: '2020-10-14' ,label: 'Party' , category: 'Travel',
		descrip: 'hotel', amount: 100, userid: 1}


	try {
		//add two expense
		await expenses.AddExpense(details)
		await expenses.AddExpense(details2)

		//approve both expenses
		await expenses.approve(1)
		await expenses.approve(2)

		//retrieve total
		 const total = await expenses.getApprovedTotal(details.userid)

		// right answer : 394 + 100 = 494
		 test.is(total, 494, 'incorrect total')

	} catch(err) {
		console.log(err.message)
		test.fail('cannot show total')

	} finally {
		expenses.close()
	}
})


