import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 
import ContactSchema from './contactSchema';

class  GroupSchema extends Model {
    public id!: number;
    public name!: string;
    public grouptype!: string;
  }

GroupSchema.init( 
    {
    name: {
        type: DataTypes.STRING
    },
    grouptype:{
        type:DataTypes.STRING
    }
 

}
,
  {
    sequelize,
    modelName: 'GroupSchema', 
  });


  export default  GroupSchema;