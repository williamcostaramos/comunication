import { QueryInterface, DataTypes } from "sequelize";
module.exports = {
  async up (queryInterface: QueryInterface) {
   return queryInterface.addColumn("Tenants", "expire_at", {
     type: DataTypes.DATE,
     allowNull: true,
   })
  },

  async down (queryInterface: QueryInterface) {
    return  queryInterface.removeColumn("Tenants", "expire_at");
  }
};
