import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 


class ServiceRequest extends Model {
  public id!: number;
  public userId!: string;
  public category!: string;
  public service!: string;
  public description!: string | null;
  public timeframe!: string | null;
  public budget!: string | null;
  public searchRadius!: string | null;
  public status!: string;
  public topProviderIds! : string[];
  public acceptedProviderIds! : string[] | undefined;
  public declinedProviderIds! : string[] | undefined;
  public serviceProviderDetailsId!: string;
  public requestExpiresAt!: Date;
}

ServiceRequest.init(
  {
    userId: {
      type: DataTypes.STRING,
      // references: {
      //   model: User,
      //   key: 'roleId',
       
      // }
   
    },
    category: DataTypes.STRING,
    service: DataTypes.STRING,
    description: DataTypes.STRING,
    timeframe: DataTypes.STRING,
    budget: DataTypes.STRING,
    searchRadius: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'not searching',
    },
    topProviderIds: {
      type: DataTypes.JSON,
    },
    acceptedProviderIds: {
      type: DataTypes.JSON,
    },
    declinedProviderIds: {
      type: DataTypes.JSON,
    },
    serviceProviderDetailsId:{
      type: DataTypes.STRING,
      // references: {
      //   model: ServiceProvider,
      //   key: 'roleId',
     
      // }
      },
      requestExpiresAt:{
        type: DataTypes.DATE
      }

   
  },
  {
    sequelize,
    modelName: 'ServiceRequest', 
  }
);








export default ServiceRequest;
