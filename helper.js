
"use strick";

class Helper {
    constructor()
    {
        this.name = "";
    }
confuse(str)
    {
        let final_str="", temp_str="";
        let rand = 0;
        let i =0;
        for(i=0; i<str.length; i++)
        {
            rand = parseInt(Math.random()*1000)%10;
            temp_str+=str[i]+rand;
        }
        for(i=temp_str.length-1; i>=0; i--)
           final_str+=temp_str[i];
        return final_str;
    }
  deconfuse(str)
    {
        let temp_str="", final_str="";
        let i =0;
        for(i=str.length-1; i>=0; i--)
          temp_str+= str[i];
        for(i=0; i<temp_str.length; i+=2)
          final_str+=temp_str[i];
        return final_str;
    }
}

module.exports=Helper;