module.exports = function(sequelize, Sequelize) {

    var Team = sequelize.define('Team', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        shortName: {
            type: Sequelize.STRING,
            allowNull: false 
        },
        logo: {
            type: Sequelize.STRING
        }
    }
  );

  Team.associate = function(models){    
    Team.hasOne(models.Game, {as: 'HomeTeam', foreignKey : 'homeTeamId'});
    Team.hasOne(models.Game, {as: 'AwayTeam', foreignKey : 'awayTeamId'});
    Team.hasMany(models.Bet,{ foreignKey : 'teamId'});
  };

  return Team;

}
