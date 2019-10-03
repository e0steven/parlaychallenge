
module.exports = function(sequelize, Sequelize) {

    var Timeslot = sequelize.define('Timeslot', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        active: {
            type: Sequelize.BOOLEAN,
            allowNull: true
        },
        nextTimeslot: {
            type:Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0
        }
    });

    Timeslot.associate = function (models){
      Timeslot.hasMany(models.Game,{ foreignKey : 'timeSlotId'});
      Timeslot.hasMany(models.Snapshot,{foreignKey: 'timeSlotId'});
      Timeslot.hasMany(models.Bet, {foreignKey: 'timeSlotId'});
    }

    return Timeslot;

}
