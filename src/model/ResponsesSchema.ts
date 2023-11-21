import DataTypes, { Model } from 'sequelize';
import sequelize from '../config/connectDB';

class  QuickResponse extends Model {
    public name!: string;
    public message!: string;
    public userId!: string;
  
  }

QuickResponse.init( 
    {
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },

}
,
  {
    sequelize,
    modelName: 'QuickResponse', 
  });

  export default  QuickResponse;
