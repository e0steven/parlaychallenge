module.exports = function(sequelize, Sequelize) {

    var User = sequelize.define('User', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        last_login: {
            type: Sequelize.DATE
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        },
        bankroll: {
            type: Sequelize.DECIMAL(10,2),
            defaultValue: 50
        },
        isAdmin: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        resetPasswordToken: {
          type: Sequelize.STRING
        },
        resetPasswordExpires: {
          type: Sequelize.DATE
        }
    });

    User.associate = function(models){    
        User.hasMany(models.Bet,{ foreignKey : 'userId'});
    };

    return User;

}
