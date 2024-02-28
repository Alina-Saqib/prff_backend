import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 


class   phoneTemplates extends Model {
    public id!: number;
    public content!: string;
  }

  phoneTemplates.init( 
    {
      
      content: {
        type: DataTypes.TEXT,
      },

}
,
  {
    sequelize,
    modelName: 'phonetemplate', 
  });


  export default  phoneTemplates;