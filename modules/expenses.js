
/** @module Expenses */

import bcrypt from 'bcrypt-promise'
import sqlite from 'sqlite-async'
import fs from 'fs-extra'
import mime from 'mime-types'

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
          filename TEXT,\
          FOREIGN KEY(userid) REFERENCES users(id) \
        );'


			await this.db.run(sql)
			return this
		})()
	}


	/*function which gets all the data and saves it into the expenses table in the website.db
* it also checks if all fields are filled*/
	async AddExpense(data) {
		try{

			/*check for validation, if there is a missing field then throw error*/
			for(const item in data) {
				if(data[item].length === 0) throw new Error('missing field')
			}


			console.log(data)

			/* create new filename for the photo uploaded by the user, so it could be indentified later*/
			let filename
			if(data.fileName) {
				filename = `${Date.now()}.${mime.extension(data.fileType)}`
				console.log(filename)
				await fs.copy(data.filePath, `public/avatars/${filename}`)
			} else{
				filename = 'null' //set filename to s, so it could be identified to check which expense has a photo of value = null
			}

			/*add everything to the table*/
			const sql = `INSERT INTO expenses(expense_date, category, label,descrip,amount,userid,filename) VALUES("${data.date}",\
                  "${data.category}", "${data.label}",\
                  "${data.descrip}",${data.amount},"${data.userid}","${filename}")`


			await this.db.run(sql)

		} catch(err) {
			console.log('ERROR:!')
			console.log(err)
			throw err
		}


		return true
	}


	/*function to retrieve data from the expenses table in website.db.
* * This function also sets a placeholder image if an img url is not present
and simplifies the datatime just to date in format DD/MM/YYYY*/
	async all(userid) {

		//	const sql = `SELECT expense_date, category, label, descrip, amount,img_url FROM expenses\
		const sql = `SELECT expense_id,expense_date, category, label, descrip, amount,filename,userid FROM expenses\
                  WHERE userid = "${userid}" ORDER BY expense_date DESC;`

		const expenses = await this.db.all(sql)
		for(const index in expenses) {
			if(expenses[index].filename === 'null') expenses[index].filename = 'calculator.jpg'
			const dateTime = new Date(expenses[index].expense_date)
			const date = `${dateTime.getDate()}/${dateTime.getMonth()+1}/${dateTime.getFullYear()}`
			expenses[index].expense_date = date
		}

		return expenses
	}


	async close() {
		await this.db.close()
	}
  
  async get_expense(expense_id) {

		
		const sql = `SELECT expense_id,expense_date, category, label, descrip, amount,filename,userid FROM expenses\
                  WHERE expense_id = ${expense_id} ORDER BY expense_date DESC;`
                  

		const expense = await this.db.get(sql)
	
    if(expense.filename === 'null') expense.filename = 'calculator.jpg'
    const dateTime = new Date(expense.expense_date)
    const date = `${dateTime.getDate()}/${dateTime.getMonth()+1}/${dateTime.getFullYear()}`
    expense.expense_date = date
		

		return expense
	}


	async close() {
		await this.db.close()
	}
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
}

export default Expenses
