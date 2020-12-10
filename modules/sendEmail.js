
/** @module sendEmail */
import nodemailer from 'nodemailer'


/**
   * Summary:
   * This class is used to send emails
   * to members
   * once an expense gets approved
   * ES6 module
   */

class Email {

	/**
	 * Summary:
	 * This function creates a route
	 * and sends an email using the
	 * gmail sever, using an account
	 * that I created.
	 *
	 *
	 * @param {String} E-mail address
   * @param {Integer} Expense ID
	 * @returns {Boolean} returns true
	 * when an email is sucessfully sent.
	 */
	async sendEmail(receiver,expenseID) {

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: 'javascript3211@gmail.com',
				pass: 'Javascript'
			}

		})

		const msg = `Expense ID : ${expenseID} has been successfully approved`

		const mailOtions = {
			from: 'javascript3211@gmail.com',
			to: receiver,
			subject: 'Expense Approved',
			text: msg
		}

		transporter.sendMail(mailOtions, async(err,data) => {
			if(err) {
				console.log('Error email not sent : ',err)
			}else{
				console.log(`Email Succesfully sent to ${receiver}`)
				true
			}
		})
	}
}

export default Email
