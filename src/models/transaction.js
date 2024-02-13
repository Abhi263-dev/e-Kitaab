module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('transaction', {
      action: {
        type: DataTypes.STRING, // 'borrow' or 'return'
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  
    return Transaction;
  };