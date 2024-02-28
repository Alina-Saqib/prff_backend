import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'; 
import User from './UserSchema';
import ServiceProvider from './ServiceProviderSchema';
import GroupSchema from './contactGroupSchema';

class  ContactSchema extends Model {
    public id!: number;
    public phone!: string;
    public email!: string;
    public userId!: string;
    
  
  }

ContactSchema.init( 
    {
  phone: {
    type: DataTypes.STRING,
    
  },
  email: {
    type: DataTypes.STRING,
   
  },
  userId: {
    type: DataTypes.STRING,
  
  },

}
,
  {
    sequelize,
    modelName: 'ContactSchema', 
  });

  
  User.hasOne(ContactSchema);
  ServiceProvider.hasOne(ContactSchema);
  ContactSchema.belongsToMany(GroupSchema, { through: 'UserGroup' });
  GroupSchema.belongsToMany(ContactSchema, { through: 'UserGroup' });
  export default  ContactSchema;