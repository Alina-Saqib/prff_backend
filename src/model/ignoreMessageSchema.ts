import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 

class  IgnoreMessages extends Model {
  public id!: number;
  public MessageText!: string;

}

IgnoreMessages.init(
  {
    MessageText: {
      type: DataTypes.STRING,
      allowNull: false,
    },

   
  },
  {
    sequelize,
    modelName: 'IgnoreMessages', 
  }
);



export default IgnoreMessages;
