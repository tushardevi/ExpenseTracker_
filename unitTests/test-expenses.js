
import test from 'ava'
import Expenses from '../modules/expenses.js'
/*expenses unit testing*/

/*This test will check if data is processed with missing fields or not*/
test('ADD EXPENSE    : missing fields', async test => {
	test.plan(1)
  //Arrange
	const expenses = await new Expenses()
  const data = {date : '02/12/2020' ,label: '' , category : 'Food', description: 'meeting', amount: 394}
  
  //Act & Assert
	try {
		await expenses.AddExpense(data)
		test.fail('error not thrown')
    
	} catch(err) {
    
		test.is(err.message, 'missing fields', 'incorrect error message')
	} finally {
		expenses.close()
	}
})


/*This test will check if the functions adds the data into the database without getting any errors*/

test('ADD EXPENSE    : adding expense to DB', async test => {
	test.plan(1)
  
  
	const expenses = await new Expenses()
  const data = {date : '02/12/2020' ,label: 'associates' , category : 'Food', descrip: 'meeting', amount: 394, userid: 3}
  
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


