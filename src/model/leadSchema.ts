import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 


class  leadSchema extends Model {
    public id!: number;
    public name!: string;
    public phone!: string;
    public email!: string;
  
  }

leadSchema.init( 
    {
  name: { type: DataTypes.STRING,
             },

  phone: {
    type: DataTypes.STRING,
    
  },
  email: {
    type: DataTypes.STRING,
   
  },

}
,
  {
    sequelize,
    modelName: 'leadSchema', 
  });

  

  export default  leadSchema;