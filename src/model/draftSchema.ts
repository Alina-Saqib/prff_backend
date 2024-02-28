import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 


class  draftSchema extends Model {
    public id!: number;
    public toEmails!: string;
    public subject!: string;
    public emailContent!: string;
    public scheduledTime!:Date;
  }

draftSchema.init( 
    {
      toEmails: {
        type: DataTypes.STRING,
      },
      subject: {
        type: DataTypes.STRING,
      },
      emailContent: {
        type: DataTypes.TEXT,
      },
      scheduledTime: {
        type: DataTypes.DATE,
      },
 

}
,
  {
    sequelize,
    modelName: 'draftSchema', 
  });


  export default  draftSchema;