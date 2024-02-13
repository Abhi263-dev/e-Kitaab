const db=require('../db/index')
const Books=db.books
const User=db.user;
const Transaction=db.transaction;
const sharp=require('sharp')

const { Sequelize } = require('sequelize');

const userbook=db.userbook;

const addBook=async(req,res)=>{
    //console.log(req.userType)
    if(req.userType!=='librarian')
    {
        return res.status(403).json({ error: 'Access forbidden. Only librarians can add books.' });
    }
    try {
        const { title, author, genre, copies } = req.body;
    
        const newBook = await Books.create({
          title,
          author,
          genre,
          copies,
        });
    
        res.status(201).json({ message: 'Book created successfully', book: newBook });
      } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
};

const updateBook=async (req, res) => {
    if(req.userType!=='librarian')
    {
        return res.status(403).json({ error: 'Access forbidden. Only librarians can update books.' });
    }

    const bookid  = req.params.id;
    
    const { title, genre, author, copies } = req.body;

    try {
        // Find the book by ID
        const book = await Books.findByPk(bookid);
    
        // Check if the book exists
        if (!book) {
          return res.status(404).json({ message: 'Book not found' });
        }
    
        // Update the product attributes
        book.title = title|| book.title;
        book.genre = genre|| book.genre;
        book.author= author|| book.author;
        book.copies = copies|| book.copies;

        // Save the updated product to the database
        await book.save();
    
        res.json(book);
      } catch (error) {
        console.error('Error updating Book:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }

};

const deletebook=async(req,res)=>{
    if(req.userType!=='librarian')
    {
        return res.status(403).json({ error: 'Access forbidden. Only librarians can delete books.' });
    }
    try {
        const bookId = req.params.id;
    
        const deletedBookCount = await Books.destroy({ where: { id: bookId } });
    
        if (deletedBookCount === 0) {
          return res.status(404).json({ message: 'Book not found' });
        }
    
        res.json({ message: 'Book deleted successfully' });
      } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
};

// //    
// try {
//   const whereCondition = { userId };
// if (category) {
//   whereCondition.category = category;
// }

const library=async(req,res)=>{
  const { genre, author } = req.query; 
    try {
      const whereCondition = {};
if (genre) {
  whereCondition.genre = genre;
}
if (author) {
  whereCondition.author = author;
}
        const books = await Books.findAll({
          where: whereCondition,
        });
        res.json(books);
      } catch (error) {
        console.error('Error retrieving books:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
}

const borrowbook=async (req, res) => {
    if(req.userType!=='user')
    {
        return res.status(403).json({ error: 'Access forbidden. Go register as user first!!' });
    }
    try {
      const user = req.user;
      const userId=req.user.id;
      const bookId = req.params.bookId;

       // Check if the book is available for borrowing
    const book = await Books.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found.' });
    }

    if (book.copies <= 0) {
      return res.status(400).json({ error: 'No copies available for borrowing. Please reserve' });
    }

    const entry=await userbook.findOne({ where: { userId,bookId }})   //Checking if this book is already borrowed by the user

    if(entry){
      return res.json("You have already borrowed this book!!")
    }

// 2 books per day functionality
    const borrowedBooksCount = await userbook.count({
      where: {
        userId,
        createdAt: {
          [Sequelize.Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
      },
    });

    if (borrowedBooksCount >= 2) {
      return res.status(400).json({ error: 'You can only borrow 2 books per day.' });
    }

    // Associate the user with the book (filling userbook table)
    await userbook.create({
        userId: user.id,
        bookId: book.id,
    });

        // Create a borrow transaction record
        await Transaction.create({
            action: 'borrow',
            userId: user.id,
            bookId: book.id,
          });

        // Update copies
        await book.update({ copies: book.copies - 1 });

        res.status(200).json({ message: 'Book borrowed successfully! Return it Timely!!' });

    } catch (error) {
      console.error('Error borrowing book:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

const returnbook= async (req, res) => {
    if(req.userType!=='user')
    {
        return res.status(403).json({ error: 'Access forbidden. Go register as user first!!' });
    }
    try {
      const userId = req.user.id;
      const bookId = req.params.bookId;
      const book = await Books.findByPk(bookId);
      
      // Check if the user has borrowed the book
      const isBorrowed = await userbook.findAll({
        where: { userId, bookId },
      });
  
      if (isBorrowed.length === 0) {
        return res.status(400).json({ error: 'You have not borrowed this book.' });
      }
     // Update copies
     await book.update({ copies: book.copies + 1 });
      
     // Return the book
      await userbook.destroy({ where: { bookId } });

      //Updating Transaction record
      await Transaction.create({
        action: 'return',
        userId,
        bookId,
      });
  
      res.status(200).json({ message: 'Book returned successfully. Thanks for choosing us!!' });
    } catch (error) {
      console.error('Error returning book:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };



//addphoto

const addphoto = async (req, res) => {
    const bookId = req.params.id;
    const books = await Books.findByPk(bookId);
  try
   { if (!books) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    books.image = buffer;
    await books.save();

    res.status(200).json({ message: 'Image uploaded successfully' });}

    catch(e){
      res.send('Error uploading the photo')
    }
}

const reservebook=async(req,res)=>{
    try{
      const bookId=req.params.id;


    }
    catch(e){
      
    }
  }


module.exports={addBook,updateBook,deletebook,library,borrowbook,returnbook,reservebook,addphoto};