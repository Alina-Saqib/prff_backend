import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 

class  ServiceCategory extends Model {
  public id!: number;
  public ServiceCategory!: string;

}

ServiceCategory.init(
  {
    ServiceCategory: {
      type: DataTypes.STRING,
      allowNull: false,
    },

   
  },
  {
    sequelize,
    modelName: 'ServiceCategory', 
  }
);



export default ServiceCategory;
