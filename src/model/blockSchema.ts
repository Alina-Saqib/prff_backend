import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/connectDB'

class Block extends Model {
  public id!: number;
  public blockerId!: string;
  public blockedId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Block.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    blockerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blockedId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Block',
    tableName: 'blocks',
  }
);

export default Block;
