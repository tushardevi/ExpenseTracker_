
/** @module Accounts */

import bcrypt from 'bcrypt-promise'
import sqlite from 'sqlite-async'
import fs from 'fs-extra'
import mime from 'mime-types'
const saltRounds = 10

/**
 * Accounts
 * ES6 module that handles registering accounts and logging in.
 */
class Accounts {
	/**
   * Create an account object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
      
			const sql = "CREATE TABLE IF NOT EXISTS users\
				(id INTEGER PRIMARY KEY AUTOINCREMENT,\
        firstName TEXT,\
        lastName TEXT,\
        username TEXT,\
        email TEXT,\
        password TEXT,\
        filename TEXT,\
        admin INTEGER\
        );"
      
      
      
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * registers a new user
	 * @param {String} user the chosen username
	 * @param {String} pass the chosen password
	 * @param {String} email the chosen email
	 * @returns {Boolean} returns true if the new user has been added
	 */
	async register(data) {
		try{
			for(const item in data) {
				if(data[item].length === 0) throw new Error('missing fields')
			}

			let filename
			if(data.fileName) {
				filename = `${Date.now()}.${mime.extension(data.fileType)}`
				await fs.copy(data.filePath, `public/users/${filename}`)
			} else{
				filename = 'null' //set filename to null
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
			console.log('REGISTER function : ')
			console.log(err.message)
			throw err
		}


	}

  
  /**
	 * registers a new manager
	 * @param {String} user the chosen username
	 * @param {String} pass the chosen password
	 * @param {String} email the chosen email
	 * @returns {Boolean} returns true if the new user has been added
	 */
	async registerManager(user, pass, email) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field')
		})
		let sql = `SELECT COUNT(id) as records FROM users WHERE user="${user}";`
		console.log('COUNT')

		const data = await this.db.get(sql)
		console.log(data.records)
		if(data.records !== 0) throw new Error(`username "${user}" already in use`)

		sql = `SELECT COUNT(id) as records FROM users WHERE email="${email}";`
		const emails = await this.db.get(sql)
		if(emails.records !== 0) throw new Error(`email address "${email}" is already in use`)

		pass = await bcrypt.hash(pass, saltRounds)
		sql = `INSERT INTO users(user, pass, email,admin) VALUES("${user}", "${pass}", "${email}", -1)`
		await this.db.run(sql)

		return true
	}
  
  
  
  
  
  
  
  
  
  
  

	/**
	 * checks to see if a set of login credentials are valid
	 * @param {String} username the username to check
	 * @param {String} password the password to check
	 * @returns {Boolean} returns true if credentials are valid
	 */
	async login(username, password) {

		let sql = `SELECT count(id) AS count FROM users WHERE username="${username}";`
		const records = await this.db.get(sql)
		if(!records.count) throw new Error(`username "${username}" not found`)

		sql = `SELECT id,password,admin FROM users WHERE username = "${username}";`
		const record = await this.db.get(sql)
		const valid = await bcrypt.compare(password, record.password)
		if(valid === false) throw new Error(`invalid password for account "${username}"`)


    /*if the admin column has a value of 1 means is an admin and therefore return 2 values, its id
     * and value of -1 or 0. -1 = admin and 0 = member*/
    
		if(record.admin === -1) {
			return {id: record.id, isAdmin: -1}
		} else{
			return {id: record.id, isAdmin: 0}
		}


	}

	async all() {
		const sql = 'SELECT * FROM users'
		const accounts = await this.db.all(sql)
		return accounts
	}

	async close() {
		await this.db.close()
	}
}

export default Accounts
