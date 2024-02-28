import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 


class  emailSchema extends Model {
    public id!: number;
    public toEmails!: string;
    public subject!: string;
    public emailContent!: string;
    public scheduledTime!:Date;
    public emailStatus!:string;
    public frequency!: string;
    public attachments!: string;
  }

emailSchema.init( 
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
      emailStatus:{
        type:DataTypes.STRING,
        defaultValue:"not sent"
      },
      frequency:{
        type:DataTypes.STRING,
      },
      attachments:{
        type: DataTypes.STRING
      }
 

}
,
  {
    sequelize,
    modelName: 'emailSchema', 
  });


  export default  emailSchema;