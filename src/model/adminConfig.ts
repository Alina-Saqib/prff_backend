import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 


class  adminConfig extends Model {
    public id!: number;
    public expiredHours!: number;
  }

  adminConfig.init( 
    {
        expiredHours: {
            type: DataTypes.INTEGER,
            defaultValue:"48"
          },
 

}
,
  {
    sequelize,
    modelName: 'adminConfig', 
  });


  export default   adminConfig