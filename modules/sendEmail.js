import nodemailer from 'nodemailer'

class Email {

async sendEmail(receiver){
  
  let transporter =  nodemailer.createTransport({
    service: 'gmail',
    auth: {
          user: 'javascript3211@gmail.com',
          pass: 'Javascript'
    }
 
});

  let mailOtions = {
    from: 'javascript3211@gmail.com',
    to: receiver,
    subject: 'Hey Mushyyyy',
    text: 'HI LOOP' 
  };

  transporter.sendMail(mailOtions, async  (err,data) =>{
    if(err){
      console.log('Error email not sent : ',err)
    }else{
      console.log('Email Sent!')
    }
  })
}


}

export default Email