import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 

class  AutomatedMessages extends Model {
  public id!: number;
  public MessageText!: string;

}

AutomatedMessages.init(
  {
    MessageText: {
      type: DataTypes.STRING,
      allowNull: false,
    },

   
  },
  {
    sequelize,
    modelName: ' AutomatedMessage', 
  }
);



export default AutomatedMessages;
