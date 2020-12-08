
/@module Acounts */

import bcrypt from 'bcrypt-promise'
import sqlite from 'sqlite-async'
import fs from 'fs-extra'
import mime from 'mime-types'
const saltRounds = 10

/*
 * Summary:
 * Accounts
 * ES6 module
 *
 * This class is used to add new members, check for exisiting
 * members and to retieve member details when necessary.
 */

class Accounts {
	/**
   * Create an account object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)

			const sql = 'CREATE TABLE IF NOT EXISTS users\
				(id INTEGER PRIMARY KEY AUTOINCREMENT,\
        firstName TEXT,\
        lastName TEXT,\
        username TEXT,\
        email TEXT,\
        password TEXT,\
        filename TEXT,\
        admin INTEGER\
        );'


			await this.db.run(sql)
			return this
		})()
	}


	/**
	 * Summary:
	 * This function registers members.
	 * also, it sets a placeholder img if
	 * img is not present and changes dateTime
	 * format to DD/MM/YYYY.
	 *
	 * Parameters:
	 * @param {Struct] a dictionary with the user's
	 * details.
	 * Parameters:
	 *
	 * @param {String} first name
	 * @param {String} last name
	 * @param {String} username
	 * @param {String} email
	 * @param {String} password
	 * @param {String} filename (if present)
	 *
	 * @returns {Boolean} true if the member is
	 * successfully registered.
	 */

	async register(data) {
		try{
			for(const item in data) {
				if(data[item].length === 0) throw new Error('missing fields')
			}

			let filename
			//if member provides a picture, then store it using a unique name
			if(data.fileName) {
				filename = `${Date.now()}.${mime.extension(data.fileType)}`
				await fs.copy(data.filePath, `public/users/${filename}`)
			} else{
				filename = 'null'
			}

			// checks if username exists in DB
			let sql = `SELECT COUNT(id) as records FROM users WHERE username="${data.username}";`
			const username = await this.db.get(sql)
			if(username.records !== 0) throw new Error(`username "${data.username}" already in use`)

			// checks if e-mail exists in DB
			sql = `SELECT COUNT(id) as records FROM users WHERE email="${data.email}";`
			const emails = await this.db.get(sql)
			if(emails.records !== 0) throw new Error(`email address "${data.email}" is already in use`)

			//encrypt the password
	    data.password = await bcrypt.hash(data.password, saltRounds)

			//save all details into users table
			sql = `INSERT INTO users(firstName , lastName,  username ,email,password,filename,admin)
    VALUES("${data.firstName}","${data.lastName}","${data.username }","${data.email}","${data.password}","${filename}", 0)`


			await this.db.run(sql)


			return true

		}catch(err) {
			
// 			console.log(err.message)
			throw err
		}


	}


	/**
	 * Summary:
	 * This function logins  members,
	 * it also checks for managers accounts.
	 *
	 * Parameters:
	 * @param {String} password
	 * @param {String} username
	 * @returns {Struct} returns a dictionary with
	 * different values, depending on who logged in;
	 * member or manager.
	 */
	async login(username, password) {

		//get
		let sql = `SELECT count(id) AS count FROM users WHERE username="${username}";`
		const records = await this.db.get(sql)
		if(!records.count) throw new Error(`username "${username}" not found`)

		sql = `SELECT id,password,admin FROM users WHERE username = "${username}";`
		const record = await this.db.get(sql)
		const valid = await bcrypt.compare(password, record.password)
		if(valid === false) throw new Error(`invalid password for account "${username}"`)


		if(record.admin === -1) {
			//manager
			return {id: record.id, isAdmin: -1}
		} else{
			//member
			return {id: record.id, isAdmin: 0}
		}

		return false


	}
  
  /**
	 * Summary:
	 * Function which retrieves all users' details,
   * this function also sets a placeholder image if
   * an img url is not present,
	 *
	 * Parameters:
	 * None.
	 *
	 * @returns {Struct} an array of dictionaries
	 * with all the users' details.
	 */

	async allUsers() {

		try{
			const sql = `SELECT * FROM users`
			const users = await this.db.all(sql)

			for(const index in users) {
				if(users[index].filename === 'null') users[index].filename = 'calculator.jpg'

			}

			return users

		}catch(err) {
// 			console.log(err.message)
			throw err
		}

	}
  
  
  /**
	 * Summary:
	 * Function to retrieve just one user details
   * this function also sets a placeholder image if
   * an img url is not present,
	 *
	 * Parameters:
	 * @params {Interger} userid
	 *
	 * @returns {Struct} a dictionary
	 * with user's details.
	 */

	async getUser(userid) {

		try{
			const sql = `SELECT * FROM users WHERE id = ${userid};`

			const users = await this.db.get(sql)

			for(const index in users) {
				if(users[index].filename === 'null') users[index].filename = 'calculator.jpg'
			}
			return users

		}catch(err) {
// 			console.log(err.message)
			throw err
		}


	}
  


	async close() {
		await this.db.close()
	}
}

export default Accounts
