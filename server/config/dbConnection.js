const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('faculty_task_portal_db', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql' ,
    timezone: "+05:30", 

});

const dbConnect = async () => {
    try 
    {
        await sequelize.sync(); // Syncs model with DB
        console.log('Database & tables created!');
    } 
    catch (error) 
    {
        console.error('Database sync error:', error);
    }
};

module.exports = { dbConnect , sequelize };
