const express = require('express');
const app = express();
const db = require('./db');
const path = require('path');
const Emailer = require('./email/emailer');
const bcrypt = require('bcryptjs');
const Helper = require('./helper'); 
const util = require('util');
const helmet = require('helmet');
const compression = require('compression');

//allow different sites access to this site
app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin","http://localhost:3000");
    res.header("Access-Control-Allow-Methods","GET");
    res.header("Access-Control-Allow-Headers","Content-Type");
    next();
});

//security middlewares
app.use(helmet());
app.use(compression());
// passing body data middleware
app.use(express.json()); 

//set view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');
//create class objects
const dbCon = new db();
const emailer = new Emailer();

app.get('/courses',async(req,res)=>{
    
    //get course dictionary
    let query = "select course_id, name, prereq_id from courses";
    let output = await dbCon.getDataNoCB(query,[]);
   
    if(output.code===200)
    {
        let coursesDict = output.result;
         //get  course detail
        query = "CALL GetCoursesDetail()";
        output = await dbCon.getDataNoCB(query,[]); 
        if(output.code === 200)
        {
            //note : store procedures returns two things: your data and query execution info
            res.status(200).send({coursesDetail: output.result[0],coursesDict:coursesDict}).end();
            return;
        }
        else
        {
            res.status(output.code).send(output.result).end();
            return;
        }    
    }

    //error situation
    res.status(401).send(output.result).end();
   
});

app.get('/courses/student/:studentId',async(req,res)=>{

    let studentId = req.params.studentId;
     //get course dictionary
     let query = "select course_id, name, prereq_id from courses";
     let output = await dbCon.getDataNoCB(query,[]);
     if(output.code===200)
     {
        let coursesDict = output.result;
        query = "CALL getstudentcourses("+studentId+")";
        output = await dbCon.getDataNoCB(query,[]);
        if(output.code == 200)
        {
            res.status(200).send({coursesDetail: output.result[0],coursesDict:coursesDict}).end();
            return; 
        }
        else
        {
            res.status(401).send(output.result).end();
            return;
        }   
     }

     res.status(401).send(output.result).end();  

});

app.get('/student/:id',async(req,res)=>{
      let studentId = req.params.id;
      let query = "select name from student ";
      let output = await dbCon.getDataNoCB(query,[{field:'id',value:studentId}]);
      if(output.code===200)
      {
          res.status(200).send(output.result).end();
          return;
      }
      res.status(403).send(output.result).end();
});

app.get('/subjects/:name',async(req,res)=>{
    //get subject name and use it to fetch subject id
     let subj = req.params.name;
     //console.log("subject : "+subj);
     let query = "select subj_id from subject ";
    let output = await dbCon.getDataNoCB(query,[{field:'subj_name',value:subj}]);
    if(output.code == 200)
    {
        let subjId =  output.result[0].subj_id;
        query = "select topic, detail from tutorial";
        output = await dbCon.getDataNoCB(query,[{field:'subj_id',value:subjId}]);
        if(output.code===200)
        {
            res.status(200).send(output.result).end();
            return;
        }
          
    }
   //return error for all failed cases
    res.status(output.code).send(output.result).end(); 
    
});

app.post('/userlogin/',async(req,res)=>{
    let username = req.body.username;
    let password = req.body.password;
    let query = "call isuser('"+username+"','"+password+"')";
    let output = await dbCon.getDataNoCB(query,[]);
    if(output.code===200)
    {
        let result = output.result[0];
        if(result[0].output===1)
            res.status(201).send(output.result).end();
        else
            res.status(401).send(output.result).end();
        return; 
    }
    //return error for all failed cases
    res.status(403).send(output.result).end(); 
});

app.post('/sendemail',async(req,res)=>{
   
    let userInfo = req.body;
    let emailMarkUp = `<html> <style> 
    li{
        list-style-type:none;
        padding: 5px 0px;
    }
    .pmsg{margin-left:10px}
    .msg{ border: 1px solid gray; padding: 10px; margin-left:10px}
    </style>
    <head></head>
    <body> <p style='color:gray; font-size:1.5em'>Hello Sir/Madam,</p>
    <p>You have got contact request from SSPA with the following details : </p>
    <ul>
      <li>Name : ${userInfo.name}</li>
      <li>Telephone : ${userInfo.phone}</li>
      <li>Email : ${userInfo.email}</li>
    </ul>
    <p class='pmsg'>Message : </p>
    <p class='msg'>${userInfo.message}</p>
    <br/>
    <p>Thank you.</p>
    <hr>
    </body>
    </html>
    `;
    let sendto = "chieffresher@yahoo.com";
    let subject = "Contact Message From SSPA";
    emailer.sendDirectEmail(res,emailMarkUp,subject,sendto);
    
});

app.post('/sendconfirmation',async(req,res)=>{

    let userInfo = req.body; 
    let fullname = userInfo.fullname;
    let password = userInfo.password;
    let email = userInfo.email;
    let help = new Helper();
    let cfullname = help.confuse(fullname);
    let cpassword = help.confuse(password);
    let cemail = help.confuse(email);
    //create unique id for this request
    let id = Math.random();
    //let toBeEncrypted = id+'~'+userInfo.email+"~"+userInfo.fullname+"~"+userInfo.password;
     //save request in pending approval table
     let query = "insert into pending_approval ";
     let output = await dbCon.insert(query,[{field:'id'},{field:'info1'},{field:'info2'},{field:'info3'}],
     [{value:id,isDate:false},{value:cfullname,isDate:false},
         {value:cemail,isDate:false},{value:cpassword,isDate:false}]);
     if(output.code===200)
     {
         //send encrypted user info as part of email
         let key = cfullname+"~"+cemail+"~"+cpassword;
         let emailMarkUp = `<p style='color:gray; font-size:1.5em'>SSPA Account Creation.</p>
         <p>Hello ${userInfo.fullname},</p>
         <span>Please click <a href='http://localhost:3005/createuser/${key}'>here</a> to confirm that you requested to create a student account on 
         SSPA (Sawari Software Programming Academy).</span>
         <hr>
         `;
         let subject = "Confirm Account Creation on SSPA";
         let sendto = userInfo.email;
         emailer.sendDirectEmail(res,emailMarkUp,subject,sendto);
         return; 
     }
     //error situation
     res.status(401).send({success:false}).end();
   
});

app.get('/createuser/:encryptedUserInfo',async(req,res)=>{
    let key = req.params.encryptedUserInfo.split('~');
    //check for existence of hash in db
    let query = "select id from pending_approval ";
    let output = await dbCon.getDataNoCB(query,[{field:'info1',value:key[0]},{field:'info2',value:key[1]},
                  {field:'info3',value:key[2]}]," and ");
    if(output.code===200)
    {
        if(output.result.length<=0)
        {
            res.render("error");
            return;
        }
        //success
        let help = new Helper();
        let id = output.result[0].id; 
        let fullname = help.deconfuse(key[0]);
        let email = help.deconfuse(key[1]);
        let password = help.deconfuse(key[2]);
        //create user account now
        query = ` CALL saveUser('${email}','${password}','${fullname}','student','${id}')`;
        output = await dbCon.getDataNoCB(query,[]);
        if(output.code===200)
          res.render("index");
        else
           res.render("error");

        return;
    }
    //error situation
    res.render("error");
   
});

app.get('/test',async(req,res)=>{
   
   res.render("error");
  //res.render("index");

})



app.listen(3005,"localhost",()=>{console.log("started on port 3005")});