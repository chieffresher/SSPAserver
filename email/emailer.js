
const nodemailer = require('nodemailer');
const config = require('config');

class Emailer{

    constructor(){
        /*
          //initial email transporter (smpt)
         this.transporter = nodemailer.createTransport({
            host: config.get("sspa_emailHost"), //company's smtp server
            port: config.get("sspa_emailHostPort"),
            secure: false, // true for 465, false for other ports
            auth: {
              user: config.get("sspa_senderEmail"), // company's email
              pass:config.get("sspa_senderEmailPassword")  // password to email
             },
             tls:{rejectUnauthorized:false} //this allows testing from localhost. Remove on live hosting.
            });

            if(this.transporter.Error.toString().trim()!=="")
             this.connected=false;
            else
                this.connected=true;
        */
        
    }

    async sendEmail(emailToList,subject,htmlMessage,senderName){
            // send mail with defined transport object
            let info = await this.transporter.sendMail({
            from: senderName+" <"+config.get("sspa_senderEmail")+">", // sender address
            to: emailToList.join(","), // list of receivers
            subject: subject, // Subject line
            text: "", // plain text body
            html: htmlMessage // html body
            });

            if(info.Error.toString().trim()==="") //yet to be verified
            return true;
       
            return false;
       
    }
   
   
 async sendDirectEmail(res,emailMarkUp,subject,sendto){

    //let companyEmail='info@sawarisoftware.com';
    try
    {
        //set up nodemailer transporter and use it to send mail 
    // create reusable transporter object using the default SMTP transport
    //Note : all email config info must be replace by secured ones from environment variables
    let transporter = nodemailer.createTransport({
        host: config.get("sspa_emailHost"), //company's smtp server :smptout.asia.secureserver.net
        port: config.get("sspa_emailHostPort"), //587
        secure: false, // true for 465, false for other ports
        auth: {
          user: config.get("sspa_senderEmail"),//companyEmail, // company's email : info@sawarisoftware.com
          pass: config.get("sspa_senderEmailPassword") // password to email
         },
         tls:{rejectUnauthorized:false} //this allows testing from localhost. Remove on live hosting.
        });
        // send mail with defined transport object
        let info = await transporter.sendMail({
        from: '"SSPA" <'+config.get("sspa_senderEmail")+">", // sender address
        to: sendto, // list of receivers
        subject: subject, // Subject line
        text: "", // plain text body
        html: emailMarkUp, // html body
        });

        //send feed back to client app
        res.status(201).send({sucess:true}).end();
    }
    catch(err)
    {
        console.log(err);
        res.status(401).send({sucess:false}).end();
    }
}

}

module.exports = Emailer;

