import jwt  from "jsonwebtoken";
const userAuth= async (req, res, next) => {

    const {token }= req.cookies;
    
    if (!token) { // Get the token from cookies  
        return res.status(401).json({ message: "Unauthorized , login again" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using JWT secret
       if (tokendecoded.id) {

            req.user.userid = tokendecoded.id; // Attach the user ID to the request object

         }
         

         else {
            return res.status(401).json({ message: "Unauthorized , login again" });
         }
     
        next(); // Call the next middleware or route handler


    } catch (error) {
        return res.status(401).json({ message: "Unauthorized , login again" });
    }

}

export default userAuth; // Export the middleware function for use in other files