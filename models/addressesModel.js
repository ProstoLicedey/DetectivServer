const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Addresses = sequelize.define('addresses', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    district: { type: DataTypes.STRING },
    number: { type: DataTypes.STRING },
    title: { type: DataTypes.STRING },
    info: { type: DataTypes.TEXT },
    appendix: { type: DataTypes.INTEGER }
});

(async () => {
    try {
        await Addresses.sync(); // Создаем таблицу, если ее нет
        const existingAddress = await Addresses.findOne({ where: { title: 'Пробная поездка' } });
        if (!existingAddress) {
            const address = await Addresses.create({
                district: 'Ц',
                number: '0',
                title: 'Пробная поездка',
                info: "Ура! \n Вы успешно совершили пробную поездку.",
                appendix: 0
            });
            console.log('Пробная поездка создана:', address);
        } else {
            console.log('Пробная поездка уже существует:', existingAddress);
        }
    } catch (error) {
        console.error('Ошибка при создании пробной поездки:', error);
    }
})();


module.exports = Addresses;
