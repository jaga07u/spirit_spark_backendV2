export const verifyJWT = async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
     //  console.log(req);
      //   console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
         return res.status(201).json({
            success: false,
            message: error?.message || "Invalid access token"
        })
        }
    
        req.user = user;
        next()
    } catch (error) {
       // throw new ApiError(401, error?.message || "Invalid access token")
       return res.status(401).json({
            success: false,
            message: error?.message || "Invalid access token"
        })
    }
    
}