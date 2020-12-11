import test from 'ava'
import Email from '../modules/sendEmail.js'


test('SEND EMAIL : Check if Email is sent to a member', async test => {
	test.plan(1)
	const email = await new Email()
	const emailAdress = 'javascript3211@gmail.com'
	const expenseID = 8
	const amount = 20

	try {
	  await email.sendEmail(emailAdress,expenseID,amount)

		test.pass('cannot send email')

	} catch(err) {
		test.fail('error sending email')
	}
})
