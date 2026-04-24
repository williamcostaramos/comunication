import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface) {
  return queryInterface.createTable("ChargeSequenceContacts", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    ack: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    sendCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    stopCharging: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastSentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastAckAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    chargeId: {
      type: DataTypes.INTEGER,
      references: { model: "Charges", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true
    },
    chargeSequenceId: {
      type: DataTypes.INTEGER,
      references: { model: "ChargeSequences", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false
    },
    contactId: {
      type: DataTypes.INTEGER,
      references: { model: "Contacts", key: "id" },
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
    }
  });
}

export async function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable("ChargeSequenceContacts");
}
