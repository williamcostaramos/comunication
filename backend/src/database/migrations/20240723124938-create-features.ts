import {QueryInterface} from "sequelize";
import {DataType} from "sequelize-typescript";

module.exports = {
  async up (queryInterface: QueryInterface) {
    return queryInterface.createTable("Features", {
      id:{
        type: DataType.INTEGER,
        allowNull: false,
        autoIncrement: true,
      },
      name:{
        type: DataType.STRING,
        allowNull: false
      },
      description:{
        type: DataType.STRING,
        allowNull: true
      }
    })
  },

  async down (queryInterface: QueryInterface) {
    return queryInterface.dropTable("Features");
  }
};
