import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
  Default
} from "sequelize-typescript";
import ChargeSequenceContact from "./ChargeSequenceContact";
import Tenant from "./Tenant";
import User from "./User";
import Whatsapp from "./Whatsapp";

@Table
class ChargeSequence extends Model<ChargeSequence> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  start: Date;

  @Default("pending")
  @Column(
    DataType.ENUM("pending", "scheduled", "processing", "canceled", "finished")
  )
  status: string;

  @Column(DataType.TEXT)
  message: string;

  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    const value = this.getDataValue("mediaUrl");
    if (value && value !== "null") {
      const { BACKEND_URL } = process.env;
      return `${BACKEND_URL}:${process.env.PROXY_PORT}/public/${value}`;
    }
    return null;
  }

  @Column
  mediaType: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Whatsapp)
  @Column
  sessionId: number;

  @BelongsTo(() => Whatsapp)
  session: Whatsapp;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @HasMany(() => ChargeSequenceContact)
  chargeSequenceContacts: ChargeSequenceContact[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  delay: number;

  @Default(null)
  @Column(DataType.INTEGER)
  recurrenceInterval: number | null; // em dias (null = indefinido)

  @Default("daily")
  @Column(DataType.STRING)
  recurrenceType: string; // "daily", "weekly", "monthly", "indefinite"

  @Default(true)
  @Column(DataType.BOOLEAN)
  active: boolean;
}

export default ChargeSequence;
