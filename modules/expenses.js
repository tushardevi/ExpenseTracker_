
/** @module Expenses */

import bcrypt from 'bcrypt-promise'
import sqlite from 'sqlite-async'

const saltRounds = 10

/**
 * Accounts
 * ES6 module that handles registering accounts and logging in.
 */
class Expenses {
	/**
   * Create an account object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the expenses of all users
			const sql = 'CREATE TABLE IF NOT EXISTS expenses\
				(expense_id INTEGER PRIMARY KEY AUTOINCREMENT,\
          expense_date INTEGER,\
          category TEXT,\
          label TEXT,\
          descrip TEXT,\
          amount INTEGER,\
          userid INTEGER,\
          FOREIGN KEY(userid) REFERENCES users(id) \
        );'

			//img_url TEXT,\
			await this.db.run(sql)
			return this
		})()
	}


/*function which gets all the data and saves it into the expenses table in the website.db 
* it also checks if all fields are filled*/
	async AddExpense(data) {
		console.log(data)
		// 		Array.from(arguments).forEach( val => {
		// 			if(val.length === 0) throw new Error('missing field')
		// 		})

		const sql = `INSERT INTO expenses(expense_date, category, label,descrip,amount,userid) VALUES("${data.date}",\
                  "${data.category}", "${data.label}",\
                  "${data.descrip}","${data.amount}","${data.userid}")`
		//,/*"${img_url}"*/
		await this.db.run(sql)

		return true
	}


/*function to retrieve data from the expenses table in website.db. 
* * This function also sets a placeholder image if an img url is not present
and simplifies the datatime just to date in format DD/MM/YYYY*/
	async all(userid) {
		const sql = `SELECT expense_date, category, label, descrip, amount FROM expenses\
                  WHERE userid = "${userid}" ORDER BY expense_date ASC;`

		const expenses = await this.db.all(sql)
		for(const index in expenses) {
			//if(expenses[index].img_url === null) expenses[index].img_url = 'placeholder.jpg'
			const dateTime = new Date(expenses[index].expense_date)
			const date = `${dateTime.getDate()}/${dateTime.getMonth()+1}/${dateTime.getFullYear()}`
			expenses[index].expense_date = date
		}

		return expenses
	}


	async close() {
		await this.db.close()
	}
}

export default Expenses
