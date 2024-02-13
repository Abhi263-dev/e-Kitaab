module.exports = (sequelize, DataTypes) => {
    const userbook = sequelize.define('userbook', {
        bookId: DataTypes.INTEGER,
        userId: DataTypes.INTEGER,
    });

    return userbook
}
