import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 


class  templateSchema extends Model {
    public id!: number;
    public subject!: string;
    public content!: string;
  }

  templateSchema.init( 
    {
      subject: {
        type: DataTypes.STRING,
      },
      content: {
        type: DataTypes.TEXT,
      },

}
,
  {
    sequelize,
    modelName: 'templateSchema', 
  });


  export default  templateSchema;