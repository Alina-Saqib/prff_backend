import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 


class  phoneSchema extends Model {
    public id!: number;
    public phoneNumber!: string;
    public text!: string;
    public scheduledTime!:Date;
    public smsStatus!:string;
    public frequency!: string;
    
  }

phoneSchema.init( 
    {
      phoneNumber: {
        type: DataTypes.STRING,
      },
      text: {
        type: DataTypes.STRING,
      },
      scheduledTime: {
        type: DataTypes.DATE,
      },
      smsStatus:{
        type:DataTypes.STRING,
        defaultValue:"not sent"
      },
      frequency:{
        type:DataTypes.STRING,
      },
     

}
,
  {
    sequelize,
    modelName: 'phoneSchema', 
  });


  export default  phoneSchema;