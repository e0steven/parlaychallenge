
module.exports = function(sequelize, Sequelize) {

    var Game = sequelize.define('Game', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        gameTime: {
            type: Sequelize.TIME,
            allowNull: false
        },
        spread: {
            type: Sequelize.DECIMAL(10,2),
            allowNull: true
        },
        favored: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    });

  Game.associate = function(models){    
    Game.belongsTo(models.Team, {as: 'HomeTeam', foreignKey : 'homeTeamId'});
    Game.belongsTo(models.Team, {as: 'AwayTeam', foreignKey : 'awayTeamId'});
  }

    return Game;

}
