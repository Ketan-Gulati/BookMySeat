const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{  //Higher order function
            Promise.resolve(requestHandler(req,res,next))
            .catch((err)=>next(err))
}}

export { asyncHandler }