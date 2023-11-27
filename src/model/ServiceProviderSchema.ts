import ServiceRequest from './ServiceRequestSchema';
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 

class ServiceProvider extends Model {
  public roleId!: string;
  public id!: number;
  public business!: string;
  public email!: string;
  public category!: string;
  public phone!: string;
  public service!: string;
  public zipCode!: string;
  public password!: string;
  public verify!: boolean;
  public isOnline!: boolean;
  public verificationCode!: string;
  public verificationCodeExpiresAt!: Date;
}

ServiceProvider.init(
  {
    roleId: {
      type: DataTypes.STRING,
      primaryKey:true,
      unique: true, 

    },
    business: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    category: DataTypes.STRING,
    phone: DataTypes.STRING,
    service: DataTypes.STRING,
    zipCode: DataTypes.STRING,
    password: DataTypes.STRING,
    verify: {type: DataTypes.BOOLEAN,
    defaultValue: false}
    ,
    isOnline: {type: DataTypes.BOOLEAN,
      defaultValue: false},
      verificationCode:DataTypes.STRING,
      verificationCodeExpiresAt: DataTypes.DATE
  },
  
  {
    sequelize, 
    modelName: 'ServiceProvider', 
    hooks: {
      
      beforeValidate: async (provider: ServiceProvider) => {
        if (!provider.roleId) {
          
          let roleId;
          let isUnique = false;
          let attempts = 0;

          while (!isUnique) {
            roleId = `P${attempts + 1}`; 
            const existingProvider = await ServiceProvider.findOne({ where: { roleId } });

            if (!existingProvider) {
              isUnique = true;
            } else {
              attempts++;
            }
          }

          provider.roleId = roleId!;
        }
      },
    },
  }
  );
  
// ServiceProvider.hasMany(ServiceRequest, {
//   foreignKey: 'serviceProviderDetailsId', 
//   as: 'serviceRequests',
// });  
  export default ServiceProvider;
  
  
  