import Sequelize from 'sequelize';
import dotenv from 'dotenv';

dotenv.config()

const sequelize = new Sequelize(
    process.env.DB_NAME,       
    process.env.DB_USER,        
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres'
    } 
)

export async function initDB() {
  try{
    await sequelize.sync()
    console.log('Database is running')
  }catch(e){
    console.log('Database is not working correctly')
  }
}

export default sequelize


