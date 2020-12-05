
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
          status INTEGER,\
          FOREIGN KEY(userid) REFERENCES users(id) \
        );'


			await this.db.run(sql)
			return this
		})()
	}


	/*function which gets all the data and saves it into the expenses table in
  *the website.db it also checks if all fields are filled*/

	async AddExpense(data) {
		try{

			/*check for validation, if there is a
			* missing field then throw error*/
			for(const item in data) {
				if(data[item].length === 0) throw new Error('missing field')
			}


			//	console.log(data)

			/* create new filename for the photo uploaded by the user, so it could be indentified later*/
			let filename
			if(data.fileName) {
				filename = `${Date.now()}.${mime.extension(data.fileType)}`
				console.log(filename)
				await fs.copy(data.filePath, `public/avatars/${filename}`)
			} else{
				filename = 'null' //set filename to null
			}

			/*add everything to the table*/
			const sql = `INSERT INTO expenses(expense_date, category, label,descrip,amount,userid,filename,status)\ 
                   VALUES("${data.date}",\
                  "${data.category}", "${data.label}",\
                  "${data.descrip}",${data.amount},"${data.userid}","${filename}",0)`


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
  
	async allUsers() {
   
		try{
      const sql = 'SELECT *FROM users'
      
// 			const sql = ' SELECT e.amount,a.firstName, a.lastName a.filename FROM expenses as e INNER JOIN users as a ON (e.userid = a.id);'
			const users = await this.db.all(sql)
      
					for(const index in users) {
						if(users[index].filename === 'null') users[index].filename = 'calculator.jpg'
               
            
					}
 

      
      console.log(users)
      
			return users

		}catch(err) {
			console.log(err.message)
			throw err
		}


	}
  
  async getUser(userid) {
    
		try{
			const sql = `SELECT * FROM users WHERE id = ${userid};`

	
			const users = await this.db.get(sql)
      
					for(const index in users) {
						if(users[index].filename === 'null') users[index].filename = 'calculator.jpg'
					}
			return users

		}catch(err) {
			console.log(err.message)
			throw err
		}


	}



	async close() {
		await this.db.close()
	}

	async getExpense(expenseID) {


		const sql = `SELECT expense_id,expense_date, category, label, descrip, amount,filename,userid FROM expenses\
                  WHERE expense_id = ${expenseID} AND status = 0 ORDER BY expense_date DESC;`


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


async all(userid) {

    try{
      
      const sql = `SELECT expense_id,expense_date, category, label, descrip, amount,filename,userid FROM expenses\
                  WHERE userid = "${userid}" AND status = 0 ORDER BY expense_date DESC;`

      const expenses = await this.db.all(sql)
      for(const index in expenses) {
        if(expenses[index].filename === 'null') expenses[index].filename = 'calculator.jpg'
        const dateTime = new Date(expenses[index].expense_date)
        const date = `${dateTime.getDate()}/${dateTime.getMonth()+1}/${dateTime.getFullYear()}`
        expenses[index].expense_date = date
      }

      return expenses

      }
    catch(err){
      console.log(err)
			throw err
    }
		
	}
  

	/*function to get the total amount spent by a user*/

	async getTotal(userid) {
		let total = 0 // variable to store the total

		// select only the amount of ALL expenses incurred by that user
  

		try{
			const sql = `SELECT amount FROM expenses\
                  WHERE userid = "${userid}" AND status = 0;`

			const expenses = await this.db.all(sql)
			//       console.log("BEFORE")
			//       console.log(expenses)

			// add all expenses one by one
			for(const i in expenses) {
				total = total + expenses[i]['amount']
			}

		} catch(err) {
			console.log(err.message)
		}


		return total
	}
  
  
  
  async approved(expense_id){
    try{
      const sql = `UPDATE expenses\
                  SET status = 1 WHERE expense_id = ${expense_id};`
      await this.db.run(sql)
    }catch(err){
      console.log(err.message)
      throw err
    }
    return true
  }

}

export default Expenses
