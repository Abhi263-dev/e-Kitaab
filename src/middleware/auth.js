const jwt = require("jsonwebtoken");

const db = require("../db/index");
const User = db.user;
const Librarian = db.librarian;

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "secret_secret");

    //console.log(decoded.userType)
    if (decoded.userType === "user") {
      const user = await User.findOne({
        where: {
          id: decoded.id,
        },
      });
     // const userType=userType;
    
      const userTokens = JSON.parse(user.tokens);

      const isToken = userTokens.some((userToken) => userToken.token === token);

      if (!isToken) {
        throw new Error();
      }
      req.user = user;
      req.userType = decoded.userType;
      req.token = token;
  
    }
  

 else if (decoded.userType === "librarian") {
      const librarian = await Librarian.findOne({
        where: {
          id: decoded.id,
        },
      });
    //   const userType=decoded.userType;
      const LibrarianTokens = JSON.parse(librarian.tokens);

      const isToken = LibrarianTokens.some((librarianToken) => librarianToken.token === token);

      if (!isToken) {
        throw new Error();
      }
      req.librarian = librarian;
      req.userType = decoded.userType;
      req.token = token;
  
    }

    else{
      throw new Error();
    }


    next();
  } catch (e) {
    console.error(e); // Log any caught errors
    res.status(401).send({ error: "Please authenticate!" });
  }
};

module.exports = auth;