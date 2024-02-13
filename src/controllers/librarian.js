const db = require("../db/index");
const Librarian = db.librarian;
const User=db.user;
const Transaction=db.transaction;

const register=async (req, res) => {
    try {
      const { name, email, password, } = req.body;
  
     // Create a new librarian                   
      const newUser = await Librarian.create({
        name,
        email,
        password,
      });
  
      const token = await newUser.generateToken(); //generating token
  
      res
        .status(201)
        .json({ message: "Librarian registered successfully", newUser, token });
    } catch (error) {
      console.error("Error registering librarian:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };


  const login= async (req, res) => {
    try {
      const { name, password } = req.body;
  
      const librarian = await Librarian.findByCredentials(name, password)
      const token = await librarian.generateToken();
  
      res.json({ message: "Librarian Login successful", librarian, token });
    } catch (e) {
      console.error("Error logging in librarian:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }


  const logout=async(req,res)=>{
    try {
      const curruser = req.librarian; // Retrieve the librarian from the auth middleware
  
      // Filter out the token to be removed
  
      const currentTokens = JSON.parse(curruser.tokens);
  
      const filteredTokens = currentTokens.filter((token) => {
        return token.token !== req.token;
    })
      curruser.tokens = JSON.stringify(filteredTokens);
  
      // Save the changes to the database
      await curruser.save();
  
      res.json("Logout successful");
    } catch (error) {
      console.error('Error logging out:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  
  }

  const getuser=async(req,res)=>{
    if(req.userType!=='librarian')
    {
        return res.status(403).json({ error: 'Access forbidden. You can not access the list of Customers.' });
    }
    try {
        const customers = await User.findAll();
        res.json(customers);
      } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
};

const deleteuser=async(req,res)=>{
    if(req.userType!=='librarian')
    {
        return res.status(403).json({error:'You can not delete a user!'})
    }
    try {
        const userId = req.params.id;
        const user = await User.destroy({ where: { id: userId } });
         

        if (user === 0) {
          return res.status(404).json({ message: 'Book not found' });
        }
    
        res.json(user);
      } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
}


const bookhistory=async (req, res) => {
    if(req.userType!=='librarian')
    {
        return res.status(403).json({error:'You can not access the history of the book!!'})
    }
     try {
      const bookId = req.params.bookId;
  
      // Retrieve the history of transactions for the book
      const history = await Transaction.findAll({
        where: { bookId },
        order: [['transactionDate', 'DESC']],
      });
  
      res.status(200).json({ history });
    } catch (error) {
      console.error('Error retrieving book history:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

module.exports={register,login,logout,getuser,deleteuser,bookhistory}