import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface) {
  return queryInterface.createTable("ChargeSequences", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "scheduled",
        "processing",
        "canceled",
        "finished"
      ),
      defaultValue: "pending",
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mediaType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true
    },
    sessionId: {
      type: DataTypes.INTEGER,
      references: { model: "Whatsapps", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true
    },
    tenantId: {
      type: DataTypes.INTEGER,
      references: { model: "Tenants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    delay: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recurrenceInterval: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recurrenceType: {
      type: DataTypes.STRING,
      defaultValue: "daily",
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  });
}

export async function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable("ChargeSequences");
}
