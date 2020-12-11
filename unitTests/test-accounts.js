
import test from 'ava'
import Accounts from '../modules/accounts.js'
const dbName = 'website.db'


test('REGISTER : register and log in with a valid member account', async test => {
	test.plan(1)
	const account = await new Accounts() // no database specified so runs in-memory
	const data = {firstName: 'first', lastName: 'last', username: 'user0',
		email: 'email@hotmail.com', password: 'password'}

	try {
		await account.register(data)
	  const login = await account.login('user0', 'password')

		test.is(login['isAdmin'],0,'member cannot log in')

	} catch(err) {
		test.fail('error thrown')
	} finally {
		account.close()
	}
})

/**
 * Column called "isAdmin" in users table is used to distinguish between member and manager
 * As managers are added manually into the system, I will use the website.db to test
 * if manager can login successfully.
 */
test('LOG IN : log in with a valid manager account', async test => {
	test.plan(1)
	const account = await new Accounts(dbName) // using database
	// username: manager, password: 1 already exists in the database flagged
	//as a manager account.

	try {
	  const login = await account.login('manager1','p455w0rd')

		test.is(login['isAdmin'],-1,'manager cannot log in')

	} catch(err) {
		test.fail('error thrown')
	} finally {
		account.close()
	}
})


/**
 * Duplicates
 */

test('REGISTER : register a duplicate username', async test => {
	test.plan(1)
	const account = await new Accounts()
	const data = {firstName: 'first', lastName: 'last', username: 'user0',
		email: 'email@hotmail.com', password: 'password'}

	const data2 = {firstName: 'first', lastName: 'last', username: 'user0',
		email: 'email2@hotmail.com', password: 'password'}
	try {
		await account.register(data)
		await account.register(data2)
		test.fail('same username registered twice, test failed!')

	} catch(err) {
		test.is(err.message, 'username "user0" already in use', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER : error if duplicate email', async test => {
	test.plan(1)
	const account = await new Accounts()
	const data = {firstName: 'first', lastName: 'last', username: 'user00',
		email: 'email@hotmail.com', password: 'password'}

	const data2 = {firstName: 'first', lastName: 'last', username: 'user0',
		email: 'email@hotmail.com', password: 'password'}

	try {
		await account.register(data)
		await account.register(data2)
		test.fail('same e-mail registered twice, test failed!')

	} catch(err) {
		test.is(err.message,'email address "email@hotmail.com" is in use',
			'incorrect error message')
	} finally {
		account.close()
	}
})


/**
 * Missing fields
 */

test('REGISTER : error if blank first name', async test => {
	test.plan(1)
	const account = await new Accounts()
	const data = {firstName: '', lastName: 'last', username: '',
		email: 'email@hotmail.com', password: 'password'}
	try {
		await account.register(data)
		test.fail('blank first name registered, test failed!')
	} catch(err) {
		test.is(err.message, 'missing fields', 'incorrect error message')
	} finally {
		account.close()
	}
})


test('REGISTER : error if blank last name', async test => {
	test.plan(1)
	const account = await new Accounts()
	const data = {firstName: 'first', lastName: '', username: '',
		email: 'email@hotmail.com', password: 'password'}
	try {
		await account.register(data)
		test.fail('blank last name registered, test failed!')
	} catch(err) {
		test.is(err.message, 'missing fields', 'incorrect error message')
	} finally {
		account.close()
	}
})


test('REGISTER : error if blank username', async test => {
	test.plan(1)
	const account = await new Accounts()
	const data = {firstName: 'first', lastName: 'last', username: '',
		email: 'email@hotmail.com', password: 'password'}
	try {
		await account.register(data)
		test.fail('blank username registered, test failed!')
	} catch(err) {
		test.is(err.message, 'missing fields', 'incorrect error message')
	} finally {
		account.close()
	}
})


test('REGISTER : error if blank password', async test => {
	test.plan(1)
	const account = await new Accounts()
	const data = {firstName: 'first', lastName: 'last', username: 'user0',
		email: 'email@hotmail.com', password: ''}
	try {
		await account.register(data)
		test.fail('blank password registered, test failed!')
	} catch(err) {
		test.is(err.message, 'missing fields', 'incorrect error message')
	} finally {
		account.close()
	}
})


test('REGISTER : error if blank email', async test => {
	test.plan(1)
	const account = await new Accounts()
	const data = {firstName: 'first', lastName: 'last', username: 'user0',
		email: '', password: 'password'}
	try {
		await account.register(data)
		test.fail('blank e-mail registered, test failed!')
	} catch(err) {
		test.is(err.message, 'missing fields', 'incorrect error message')
	} finally {
		account.close()
	}
})


/**
 * Invalid fields
 */

test('LOGIN    : invalid username', async test => {
	test.plan(1)
	const account = await new Accounts()
	const data = {firstName: 'first', lastName: 'last', username: 'user0',
		email: 'email@hotmail.com', password: 'password'}
	try {
		await account.register(data)
		await account.login('random', data.password)
		test.fail('member without username logged in, test failed!')
	} catch(err) {
		test.is(err.message, 'username "random" not found', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('LOGIN    : invalid password', async test => {
	test.plan(1)
	const account = await new Accounts()
	const data = {firstName: 'first', lastName: 'last', username: 'user0',
		email: 'email@hotmail.com', password: 'password'}
	try {
		await account.register(data)
		await account.login(data.username, 'random')
		test.fail('member logged in without the right password, test failed!')
	} catch(err) {
		test.is(err.message, 'invalid password for account "user0"', 'incorrect error message')
	} finally {
		account.close()
	}
})


/**
 * Database checks
 */

test('GET ALL USERS  : check if all users are correctly retrieved from the db', async test => {
	test.plan(1)

	const account = await new Accounts()
	//create 2 accounts
	const user1 = {firstName: 'first', lastName: 'last', username: 'user0',
		email: 'email@hotmail.com', password: 'password'}

	const user2 = {firstName: 'first2', lastName: 'last2', username: 'user00',
		email: 'email2@hotmail.com', password: 'password'}

	try {
		 await account.register(user1)
   	 await account.register(user2)


		const all = await account.allUsers()
		const size = all.length

		//check if size == 2
		test.is(size, 2, 'cannot show users')

	} catch(err) {
		test.fail('Error,cannot retrieve all users')
	} finally {
		account.close()

	}
})

test('GET ONE USER  : check if one user is correctly retrieved from the db', async test => {
	test.plan(1)

	const account = await new Accounts()
	//create 2 accounts
	const user1 = {firstName: 'first', lastName: 'last', username: 'user0',
		email: 'email@hotmail.com', password: 'password'}

	const user2 = {firstName: 'first2', lastName: 'last2', username: 'user00',
		email: 'email2@hotmail.com', password: 'password'}

	try {
		 await account.register(user1)
   	 await account.register(user2)

		// userid is autoincremented
		// so that user1's id = 1 and user2's = 2.
		const all = await account.getUser(2)
		const username = all.username


		test.is(username, 'user00', 'cannot show user')

	} catch(err) {
		test.fail('Error, cannot retrieve user')
	} finally {
		account.close()

	}
})


