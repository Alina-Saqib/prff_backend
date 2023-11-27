import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 
import ServiceRequest from './ServiceRequestSchema';

class User extends Model {
  public roleId!: string;
  public name!: string;
  public surname!: string;
  public email!: string;
  public phone!: string;
  public gender!: string;
  public zipCode!: string;
  public password!: string;
  public verify!: boolean;
  public verificationCode!: string;
  public verificationCodeExpiresAt!: Date;
  public isOnline!: boolean;
}

User.init(
  {
    roleId: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique: true, 
    },
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    phone: DataTypes.STRING,
    gender: DataTypes.STRING,
    zipCode: DataTypes.STRING,
    password: DataTypes.STRING,
    verify: {type: DataTypes.BOOLEAN,
      defaultValue: false},
    verificationCode:DataTypes.STRING,
    verificationCodeExpiresAt: DataTypes.DATE,
    isOnline: {type: DataTypes.BOOLEAN,
      defaultValue: false}
  },
  {
    sequelize, 
    modelName: 'User', 
    hooks: {
      beforeValidate: async (user: User) => {
        if (!user.roleId) {
          let roleId;
          let isUnique = false;
          let attempts = 0;

          while (!isUnique) {
            roleId = `U${attempts + 1}`; 
            const existingUser = await User.findOne({ where: { roleId } });

            if (!existingUser) {
              isUnique = true;
            } else {
              attempts++;
            }
          }

          user.roleId = roleId!;
        }
      },
    },
  }
);



export default User;
