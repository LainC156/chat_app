'use strict';
const { Model } = require('sequelize');
//const { User, Message } = require('./index')
module.exports = (sequelize, DataTypes) => {
  class Reaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ User, Message}) {
      // define association here
      /* one to many(user has multiple reactions) */
      this.belongsTo(Message, { foreignKey: 'messageId'}) // MessageId, me
      this.belongsTo(User, { foreignKey: 'userId'})
    }
  };
  Reaction.init({
    content: {
      type: DataTypes.STRING,
      allowNull: false
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Reaction',
    tableName: 'reactions'
  });
  return Reaction;
};