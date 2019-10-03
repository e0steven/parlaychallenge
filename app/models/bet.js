
module.exports = function(sequelize, Sequelize) {

    var Bet = sequelize.define('Bet', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        amount:{
            type: Sequelize.DECIMAL(10,2),
            defaultValue: 0
        },
        win: {
            type: Sequelize.DECIMAL(10,2),
            defaultValue: 0
        }
    });

    Bet.associate = function(models){    
        Bet.belongsTo(models.Team, {foreignKey : 'teamId'});
        Bet.belongsTo(models.User, {foreignKey : 'userId'});
        Bet.belongsTo(models.Timeslot, {foreignKey: 'timeSlotId'});
    };  

    return Bet;

}