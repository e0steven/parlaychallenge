
module.exports = function(sequelize, Sequelize) {

    var Snapshot = sequelize.define('Snapshot', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        bankroll: {
            type: Sequelize.DECIMAL(10,2),
            allowNull: false,
        },
        gamesBet: {
            type: Sequelize.INTEGER,
            allowNull: true,
            default: 0
        },
        locked: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            default: 0
        }
    });

  Snapshot.associate = function(models){    
    Snapshot.belongsTo(models.User,{foreignKey : 'userId'});
    Snapshot.belongsTo(models.Timeslot, {foreignKey : 'timeSlotId'});
  }

    return Snapshot;

}
