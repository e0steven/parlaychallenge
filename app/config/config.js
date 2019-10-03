module.exports = 
{
    "development": {
        "username": "root",
        "password": "p@ssword123",
        "database": "parlay",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "operatorsAliases": "false"
    },
 
    "production": {
        "username": process.env.PROD_USER,
        "password": process.env.PROD_DB_PW,
        "database": process.env.PROD_DB,
        "host": process.env.PROD_HOST,
        "dialect": "mysql"
 
    }
 
}