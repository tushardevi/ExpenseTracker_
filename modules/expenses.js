
/** @module Expenses */


import sqlite from 'sqlite-async'
import fs from 'fs-extra'
import mime from 'mime-types'

/**
   * Summary:
   * This class is used to add new expenses,
   * retrieve expenses' details ,
   * get a total of all expenses,
   * check for valid Date,file format and finally
   * approve expenses.
   * ES6 module
   */
class Expenses {

	/**
   * Create an expense object
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
          status INTEGER,\
          FOREIGN KEY(userid) REFERENCES users(id) \
        );'


			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * Summary:
	 * Function which gets all the data and saves it
	 * into the expenses table,
	 * also checks if all fields are filled.
	 *
	 * Dictionary is passed with the following data types:
	 * @param {String} date Date
	 * @param {String} category Category
	 * @param {String} label Label
	 * @param {String} description Description
	 * @param {Integer} amount Amount spent
	 * @param {Integer} userid User ID
	 * @param {String} filename. Scanned receipt (if present)
	 *
	 * @returns {Boolean} returns true if
	 * the new expense is sucessfully added.
	 */
	async AddExpense(data) {
		try{
			for(const item in data) {
				if(data[item].length === 0) throw new Error('missing fields')
			}

			//create new filename for the photo uploaded by the user, so it could be indentified later
			let filename
			if(data.fileName) {
				filename = `${Date.now()}.${mime.extension(data.fileType)}`
				console.log(filename)
				await fs.copy(data.filePath, `public/avatars/${filename}`)
			} else{
				filename = 'null'
			}

			const sql = `INSERT INTO expenses(expense_date, category, label,descrip,amount,userid,filename,status)\ 
                   VALUES("${data.date}",\
                  "${data.category}", "${data.label}",\
                  "${data.descrip}",${data.amount},"${data.userid}","${filename}",0)`
			await this.db.run(sql)

		} catch(err) {
			throw err
		}
		return true

	}


	/**
	 * Summary:
	 * Function to retrieve data from the expenses' table
   * This function also sets a placeholder image if
   * an img url is not present,
   * and changes dateTime's format to DD/MM/YYYY.
	 *
	 * Parameters:
	 * @param {Integer} userid User ID
	 *
	 * @returns {Struct} an array of dictionaries
	 * with all the expense details.
	 */

	async all(userid) {

		try{

			const sql = `SELECT expense_id,expense_date, category, label, descrip, amount,filename,userid FROM expenses\
                  WHERE userid = "${userid}" AND status = 0 ORDER BY expense_date DESC;`

			const expenses = await this.db.all(sql)
			for(const index in expenses) {
				if(expenses[index].filename === 'null') expenses[index].filename = 'place.jpg'
				const dateTime = new Date(expenses[index].expense_date)
				const date = `${dateTime.getDate()}/${dateTime.getMonth()+1}/${dateTime.getFullYear()}`
				expenses[index].expense_date = date
			}

			return expenses

		} catch(err) {
			// 			console.log(err.message)
			throw err
		}

	}
	async close() {
		await this.db.close()
	}


	/**
	 * Summary:
	 * Function to retrieve a single expense
	 * from the expenses' table
   * This function also sets a placeholder image if
   * an img url is not present,
   * and chancges datatime format to DD/MM/YYYY.
	 *
	 * Parameters:
	 * @param {Integer} ExpenseID Expense ID
	 *
	 * @returns {Struct} a dictionary
	 * with all the expense details.
	 */

	async getExpense(expenseID) {


		const sql = `SELECT expense_id,expense_date, category, label, descrip, amount,filename,userid FROM expenses\
                  WHERE expense_id = ${expenseID} AND status = 0 ORDER BY expense_date DESC;`


		const expense = await this.db.get(sql)

		if(expense.filename === 'null') expense.filename = 'place.jpg'
		const dateTime = new Date(expense.expense_date)
		const date = `${dateTime.getDate()}/${dateTime.getMonth()+1}/${dateTime.getFullYear()}`
		expense.expense_date = date


		return expense
	}


	async close() {
		await this.db.close()
	}


	/**
	 * Summary:
	 * Function to check if the user inputs the right date.
   * so that input_date <= current_date.
	 *
	 * Parameters:
	 * @param {String} Date Date of expense
	 *
	 * @returns {Boolean} return true if Date is valid
	 * otherwise throws error.
	 */
	async checkDate(expenses) {

		// get the date given by the user
		const date = new Date(expenses.date)

		// get the current date
		const currentDate = new Date()


		// perform a check
		try{
			if(date > currentDate ) throw new Error('Date must be less or equal to todays date')


		} catch(err) {
			// 			console.log(err.message)
			throw err
		}


		return true
	}


	/**
	 * Summary:
	 * Function to get the total spent on expenses.
	 *
	 * Parameters:
	 * @param {Integer} userid User ID.
	 *
	 * @returns {Integer} returns total.
	 */
	async getTotal(userid) {
		let total = 0 // variable to store the total

		// select the amount spent in ALL expenses by the user
		try{
			const sql = `SELECT amount FROM expenses\
                  WHERE userid = "${userid}" AND status = 0;`

			const expenses = await this.db.all(sql)


			// add all expenses one by one
			for(const i in expenses) {
				total = total + expenses[i]['amount']
			}

		} catch(err) {
			// 			console.log(err.message)
		}


		return total
	}


	/**
	 * Summary:
	 * Function which checks the file format when a user tries to upload a file.
	 *
	 * Parameters:
	 * @params {Struct} fileInfo All the file details like
   * file path, file name and file type.
   *
   * @params {String} fileName Name of file.
   * @params{String} filePath Path address.
   * @params {String} fileType Type of file.
   *
   *
   * @returns {Boolean} returns true if file type is valid
	 */

	async checkFileFormat(fileInfo) {


		try{
			const type = fileInfo.fileType
			const includes = type.includes('image')
			if(!includes) throw new Error('Invalid file format')

		}catch(err) {
			// 			console.log(err)
			throw err
		}


		return true
	}

	/**
	 * Summary:
	 * Function which approves
	 * and hides expenses once they are approved.
	 *
	 * Parameters:
	 * @params {Interger} ExpenseID Expense ID.
	 *
	 * @returns {Boolean} true if the expense is
	 * successfully approved,
	 * otherwise throws an error.
	 */

	async approve(expenseID) {
		try{
			const sql = `UPDATE expenses\
                  SET status = 1 WHERE expense_id = ${expenseID};`
			await this.db.run(sql)

			return true
		}catch(err) {
			// 			console.log(err.message)
			throw err
		}

	}


  	/**
	 * Summary:
	 * Function to get the total of all approved expenses.
	 *
	 * Parameters:
	 * @param {Integer} userid the User ID.
	 *
	 * @returns {Integer} returns the total of all approved expenses.
	 */
	async getApprovedTotal() {
		let total = 0

		// select the amount spent in ALL expenses by the user
		try{
			const sql = 'SELECT amount FROM expenses\
                  WHERE status = 1;'

			const expenses = await this.db.all(sql)


			// add all expenses one by one
			for(const i in expenses) {
				total = total + expenses[i]['amount']
			}

		} catch(err) {
			// 			console.log(err.message)
		}


		return total
	}


}

export default Expenses
