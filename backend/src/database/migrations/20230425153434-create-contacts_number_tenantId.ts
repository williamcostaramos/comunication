import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS Contacts_number_tenantId ON "Contacts" (number, "tenantId");
    `);
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS Contacts_number_tenantId;
    `);
  }
};