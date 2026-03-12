import {QueryInterface, DataTypes} from "sequelize";


module.exports = {
  async up(queryInterface: QueryInterface) {
    return queryInterface.createTable("Roles", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    })
  },

  async down(queryInterface: QueryInterface) {
    return queryInterface.dropTable("Roles");
  }
};
