import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../db.js';

const defineUser = (sequelizeInstance) => {
    return sequelizeInstance.define('User', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
};

const User = defineUser(sequelize);

export { defineUser };
export default User; 

