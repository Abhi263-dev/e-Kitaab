const { Sequelize, DataTypes } = require('sequelize');

const mysql2 = require("mysql2");

const sequelize = new Sequelize('bookstore','root','Abhi2603',{
    host: "localhost",
    dialect: 'mysql',   //database name in phpmyAdmin through Xampp
    logging: false
});

sequelize.authenticate()
.then(()=>{
    console.log("connected");
})
.catch(err=>{
    console.log("error"+err)
})

const db={}

db.sequelize=sequelize
db.Sequelize = Sequelize
//require models
db.user=require('../models/user')(sequelize,DataTypes)
db.books=require('../models/books')(sequelize,DataTypes)
db.librarian=require('../models/librarian')(sequelize,DataTypes)
db.userbook=require('../models/userbook')(sequelize,DataTypes)
db.transaction=require('../models/transaction')(sequelize,DataTypes)

db.categories=require('../models/categories')(sequelize,DataTypes)
db.bookcategory=require('../models/bookcategory')(sequelize,DataTypes)

//Many to many relation between user and book

db.user.belongsToMany(db.books, { through: 'userbook', foreignKey: 'userId' });
db.books.belongsToMany(db.user, { through: 'userbook', foreignKey: 'bookId' });

sequelize.sync()
  .then(() => {
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });


module.exports = db;


// const env = process.env.NODE_ENV || 'development';
//const config = require('../config/config.json')[env];

//const sequelize = new Sequelize(config.database, config.username, config.password, config);
