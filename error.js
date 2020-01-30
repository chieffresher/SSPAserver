function getError(code,status,field)
{
    let message = "";
    switch(code)
    {
        case "AUT_01": message = "Authorization code is empty."; break;
        case "AUT_02": message = "Access Unauthorized."; break;
        case "PAG_01": message = "The order is not matched 'field,(DESC|ASC)'."; break;
        case "PAG_02": message = "The field of order is not allow sorting."; break;
        case "USR_01": message = "Email or Password is invalid"; break;
        case "USR_02": message = "The "+ field+ " are/is required"; break;
        case "USR_03": message = "The email is invalid."; break;
        case "USR_04": message = "The email already exists."; break;
        case "USR_05": message = "The email doesn't exist."; break;
        case "USR_06": message = "this is an invalid phone number."; break;
        case "USR_07": message = "this is too long "+field+"."; break;
        case "USR_08": message = "this is an invalid Credit Card."; break;
        case "USR_09": message = "The Shipping Region ID is not number."; break;
        case "CAT_01": message = "Don't exist category with this ID."; break;
        case "DEP_01": message = "The ID is not a number."; break;
        case "DEP_O2": message = "Doesn't exist department with this ID."; break;

        default: message = "Internal Server Error"; break;
    }

     let error = {
         code:code,
         status:status,
         message:message,
         field:field
     }

     return {error:error};
}

module.exports.getError = getError;