const express=require('express')
const app=express()

// require('dotenv').config();
const userRouter=require('./routers/user')
const librarianRouter=require('./routers/librarian')
const bookRouter=require('./routers/books')


const port=process.env.PORT||3000

app.use(express.json())

app.use(userRouter)
app.use(librarianRouter)
app.use(bookRouter)


app.listen(port,async()=>{
    console.log('connected')
})




