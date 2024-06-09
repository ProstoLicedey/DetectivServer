const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    login: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false }
});


(async () => {
    try {
        await User.sync(); // Создаем таблицу, если ее нет
        const admin = await User.create({
            login: 'admin',
            password: 'QWEasd123!@#',
            role: 'admin'
        });
        console.log('Администратор создан:', admin);
    } catch (error) {
        console.error('Ошибка при создании администратора:', error);
    }
})();

module.exports = User;