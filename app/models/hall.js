
module.exports = function(sequelize, Sequelize) {

    var Hall = sequelize.define('Hall', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name:{
            type: Sequelize.STRING,
            defaultValue: 0
        },
        year:{
            type: Sequelize.STRING,
            defaultValue: ''
        },
        win: {
            type: Sequelize.DECIMAL(10,2),
            defaultValue: 0
        }
    });

    return Hall;

}