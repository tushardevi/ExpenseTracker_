import Email from '../modules/sendEmail.js'

const email = await new Email()



try{
  await email.sendEmail('javascript3211@gmail.com')
}catch(err){
  console.log(err.message)
  throw err
}