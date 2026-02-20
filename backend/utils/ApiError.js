class ApiError extends Error{
    constructor(
        statusCode,
        message = "Something went wrong",
        errors=[],
        stack=""
    ){
        super(message)    //this calls the parent Error constructor.
        this.statusCode=statusCode
        this.errors=errors
        this.data=null
        this.success = false

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export { ApiError }