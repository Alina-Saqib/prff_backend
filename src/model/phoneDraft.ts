import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 


class  phoneDraft extends Model {
    public id!: number;
    public phoneNumber!: string;
    public text!: string;
    public scheduledTime!:Date;
    public frequency!:string;
  }

 phoneDraft.init( 
    {
    phoneNumber: {
        type: DataTypes.STRING,
      },
      text: {
        type: DataTypes.TEXT,
      },
      scheduledTime: {
        type: DataTypes.DATE,
      },
      frequency:{
        type: DataTypes.STRING
      }
 

}
,
  {
    sequelize,
    modelName: 'phoneDraft', 
  });


  export default  phoneDraft;