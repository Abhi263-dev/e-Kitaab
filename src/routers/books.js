const auth = require("../middleware/auth");
const express = require("express");
const multer=require('multer')

const router = new express.Router();

const {addBook,updateBook,deletebook,library,borrowbook,returnbook,reservebook,addphoto}=require('../controllers/books')


//Add
router.post('/book/add',auth,addBook)

//Add photo

const upload = multer({
  // dest: 'avatars',
  limits: {
      fileSize: 1000000
  },
  fileFilter(req, file, cb){
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
          return cb(new Error('please upload an image'))
      }
      cb(undefined, true)
  }

})

router.post('/book/photo/:id',auth,upload.single('book'),addphoto)

//Update
router.patch('/book/update/:id',auth,updateBook)

//Remove 
router.delete('/book/remove/:id',auth,deletebook)

//Library 
router.get('/books',library)

// BOOKS borrowing and return functionality 

// Borrow a book
router.post('/book/borrow/:bookId', auth, borrowbook);
  
  // Return a borrowed book
router.post('/book/return/:bookId', auth,returnbook);

//book reservation functionality
router.post('/book/reserve/:id',auth, reservebook)


module.exports=router