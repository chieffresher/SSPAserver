"use strict";
const mysql = require('mysql');
const config = require('config');
const errorer = require("./error");


class db{

    constructor()
    {
        this.clientErrorMessage="internal server error.";
        this.serverConsoleMessage = "connection failed.";

        this.conn = mysql.createConnection({
            host:config.get("sspa_dbhost"),
            user: config.get("sspa_dbuser"),
            password:"",//password:config.get("dbuserpassword"),
            database: config.get("sspa_database")
        });         
    }

    //promise-based implementation
    search(table,selectFields,criteria,response)
    {
        const prom = new Promise((resolve,reject)=>
        {
           // prepare for error
           var outputError = errorer.getError("INT",500,"");
            //get items requested
            let query="select "+selectFields+" from "+table+" where "+criteria; 
            try{
                if(this.conn.state!="authenticated")
                {
                    this.conn.connect((error)=>
                    {
                        if(error)
                        {
                            reject(outputError); return;
                        }
                      
                        this.conn.query(query,(err,result)=>
                        {
                             if(err)
                               reject(outputError);
                               
                             else
                               resolve(result);
                        }); 
                      
                  });
                }
                else
                {
                     this.conn.query(query,(err,result)=>
                     {
                          if(err)
                            reject(outputError);
                          else 
                            resolve(result);
                     }); 
                }

             }
             catch(exception)
             {
                reject(outputError);
            }

        });
        prom.then((result)=>{
            response.status(200).send(result).end();  
        })
        .catch((error)=>{
            response.status(500).send(error).end();
            console.log(this.serverConsoleMessage+": "+error);
        });
         
    }
    
    //callback approach
    getData(query,displayer)
    {
        try
        {
             // prepare for error
             var outputError = errorer.getError("INT",500,"");

            if(this.conn.state!="authenticated")
            {
                this.conn.connect((err)=>{
                    if(err){
                        displayer(500,outputError);
                        return;
                    }
                });
            }
            //get data now
            this.conn.query(query,(err,result)=>{
                  if(err)
                    displayer(500,outputError);
                  else
                     displayer(200,result);
            });
        }
        catch(err)
        {
           displayer(500,outputError);
        }
    }
     
    getDataNoCB(query,listOfConditions, combiner=" and ")
    { 
        var prom = new Promise((resolve,reject)=>
        {
            try
            {
                  // prepare for error
              var outputError = errorer.getError("INT",500,"");
           
                  // connect
            if(this.conn.state!="authenticated")
            {
                this.conn.connect((err)=>{
                    if(err){
                        reject({code:500,result:outputError});
                        return;
                    }
                });
            }
          
             //form query properly (check for sql injections)
             if(listOfConditions.length>0)
                query+=" where ";
             for(var i=0; i<listOfConditions.length; i++)
             {
                 var curCon = listOfConditions[i];
                 query+= curCon.field+"="+this.conn.escape(curCon.value)+" ";
                 if(i<listOfConditions.length-1)
                    query+=combiner;
             } 
            // console.log(query);  
            //get data now
             this.conn.query(query,(err,result)=>{
                if(err)
                {
                    console.log(err);
                    reject({code:500,result:outputError});
                }
                  
              else
                  resolve({code:200,result:result});
               });

           }
        catch(err){
            reject({code:500,result:outputError});
            return;
        }
       });
        
       prom.catch(err=>console.log(err));
      return prom;
        
    }

    saveData(query,displayer)
    {
        try
        {
                // prepare for error
                var outputError = errorer.getError("INT",500,"");

            if(this.conn.state!="authenticated")
            {
                this.conn.connect((err)=>{
                    if(err){
                        displayer(500,outputError);
                        return;
                    }
                });
            }
            //save data now
            this.conn.query(query,(err,result)=>{
                  if(err)
                    displayer(500,outputError);
                  else
                     displayer(200,result);
            });
        }
        catch(err)
        {
           displayer(500,outputError);
        }
    }

    update(query,listOfUpdates,listOfConditions)
    {

         var prom = new Promise((resolve,reject)=>{
               // prepare for error
               var outputError = errorer.getError("INT",500,"");

            if(this.conn.state!="authenticated")
            {
                this.conn.connect((err)=>{
                    if(err){
                        reject({code:500,result:outputError});
                        return;
                    }
                });
            } 
            
             //form query
             query+=" set ";
             for(var i=0; i<listOfUpdates.length; i++)
             {
                 var curCon = listOfUpdates[i];
                 query+= curCon.field+"="+this.conn.escape(curCon.value)+" ";
                 if(i<listOfUpdates.length-1)
                    query+=" , ";
             } 
             //form query properly (check for sql injections)
             query+=" where ";
             for(var i=0; i<listOfConditions.length; i++)
             {
                 var curCon = listOfConditions[i];
                 query+= curCon.field+"="+this.conn.escape(curCon.value)+" ";
                 if(i<listOfConditions.length-1)
                    query+=" and ";
             } 
             //update data now
             this.conn.query(query,(err,result)=>{
                if(err)
                  reject({code:500,result:outputError});
                else
                {
                    resolve({code:200,result:result});
                }
                   
             });

        });
       
        return prom;
    }

    delete(query,listOfConditions)
    {

         var prom = new Promise((resolve,reject)=>{
             // prepare for error
             var outputError = errorer.getError("INT",500,"");
            if(this.conn.state!="authenticated")
            {
                this.conn.connect((err)=>{
                    if(err){
                        reject({code:500,result:outputError});
                        return;
                    }
                });
            } 
            
             //form query properly (check for sql injections)
             query+=" where ";
             for(var i=0; i<listOfConditions.length; i++)
             {
                 var curCon = listOfConditions[i];
                 query+= curCon.field+"="+this.conn.escape(curCon.value)+" ";
                 if(i<listOfConditions.length-1)
                    query+=" and ";
             } 
            // console.log(query);
             //update data now
             this.conn.query(query,(err,result)=>{
                if(err)
                  reject({code:500,result:outputError});
                else
                {
                    resolve({code:200,result:result});
                }
                   
             });

        });
       
        return prom;
    }

    insert(query,fieldsCollection,valuesCollection)
    {
    
         var prom = new Promise((resolve,reject)=>{
              // prepare for error
              var outputError = errorer.getError("INT",500,"");

             if(fieldsCollection.length != valuesCollection.length)
             {
                 reject({code:500,result:outputError});
                 return;
             }

            if(this.conn.state!="authenticated")
            {
                this.conn.connect((err)=>{
                    if(err){
                        reject({code:500,result:outputError});
                        return;
                    }
                });
            } 
            
             //form query
             //fields
             query+=" ( ";
             for(var i=0; i<fieldsCollection.length; i++)
             {
                 var curCon = fieldsCollection[i];
                 query += curCon.field;
                 if(i<fieldsCollection.length-1)
                    query+=" , ";
             }
             query+= ")"; 
             //values
             query+=" values ( ";
             for(var i=0; i<valuesCollection.length; i++)
             {
                 var curCon = valuesCollection[i];
                 if(!curCon.isDate)
                  query += this.conn.escape(curCon.value);
                 else
                   query += curCon.value;

                 if(i<valuesCollection.length-1)
                    query+=" , ";
             }
             query+= ")"; 
             //console.log(query);
             //insert data now
             this.conn.query(query,(err,result)=>{
                if(err)
                  reject({code:500,result:outputError});
                else
                {
                    resolve({code:200,result:result});
                }
                   
             });

        });
        prom.catch(err=>console.log(err));
        return prom;
    }

   async getAllItems(response,item)
    {
        try{

            // prepare for error
            var outputError = errorer.getError("INT",500,"");

              //get items requested
              let query="";
              switch(item)
              {
                 case "attribute" :  
                       query="select attribute_id,name from attribute"; break;
                 case "category" :  
                       query="select category_id,name,description,department_id from category"; break;
                 case "department" :  
                        query="select department_id,name,description from department"; break;
                 case "product" :  
                        query="select product_id,name,description,price,discounted_price,thumbnail from product"; break;
                 case "tax": 
                        query="select tax_id,tax_type,tax_percentage from tax"; break;
                 default : 
                         query="select 'nothing'"; break;
              }

            if(this.conn.state!="authenticated")
            {
               await this.conn.connect((error)=>
                {
                    if(error)
                    {
                        //console.log(this.serverConsoleMessage);
                        response.status(500).send(outputError).end();
                        return;
                    }
                });   
            }
               
            //get data      
            await this.conn.query(query,(err,result)=>
                     {
                          if(err){
                            response.status(500).send(outputError).end();
                            return; 
                          }
                          response.status(200).send(result).end();
                     }); 
        }
        catch(exception){
            console.log(this.serverConsoleMessage);
            response.status(500).send(outputError).end();
            return;
        }
    }
}

module.exports=db;