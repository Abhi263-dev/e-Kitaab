const db=require('../db/index')
const User=db.user


const register = async (req, res) => {
  try {
      const UserCount = await User.count();
      if (UserCount > 0) {
          const user = req.user;
          if (!user || user.getDataValue("role") !== "Manager") {
              return res
                  .status(401)
                  .send({ error: "Please authenticate as a manager!" });
          }
      }
      const user = await User.create(req.body)
      const token = await user.generateToken()
      res.status(201).json({ message: "Registration successfully!",user ,token})


  } catch (e) {
      res.status(500).json({ message: "Internal Server Error" })
  }
}

const login = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      const user = await User.findByCredentials(username, password)
      const token = await user.generateToken();
  
      res.json({ message: "Login successful", user, token });
    } catch (e) {
      console.error("Error logging in user:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
};

const logout= async(req,res)=>{
    try {
      const curruser = req.user;
  
      const currentTokens = JSON.parse(curruser.tokens);
  
      const filteredTokens = currentTokens.filter((token) => {
        return token.token !== req.token;
    })
      curruser.tokens = JSON.stringify(filteredTokens);
  

      await curruser.save();

  
      res.json("Logout successful");
    } catch (error) {
      console.error('Error logging out:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  
  }

const logoutall=async(req,res)=>{
  try{
       const curruser=req.user;
       curruser.tokens=[];
       await curruser.save();

  }
  catch(e){
    console.error('Error logging out:', e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


module.exports={register,login,logout,logoutall}