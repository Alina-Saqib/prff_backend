import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB';  

class Chat extends Model {
  public id!: number;
  public user1!: string;
  public user2!: string;
  public messages?: Messages[];
  public isBlocked?: Boolean;
  public BlockedBy?: string | null;
}

export interface Messages {
    sender: string;
    text: string;
    timestamp: Date;
}

Chat.init(
  {
    user1: DataTypes.STRING,
    user2: DataTypes.STRING,
    messages: {
      type: DataTypes.JSON ,
    },
    isBlocked: DataTypes.BOOLEAN,
    BlockedBy: {
type: DataTypes.STRING,
allowNull: true,
}
  },
  {
    sequelize, 
    modelName: 'Chat', 
  }
);

export default Chat;
