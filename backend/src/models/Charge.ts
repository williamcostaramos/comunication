import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default,
  DataType
} from "sequelize-typescript";

import Contact from "./Contact";
import Ticket from "./Ticket";
import Tenant from "./Tenant";

@Table
class Charge extends Model<Charge> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  description: string;

  @AllowNull(false)
  @Column(DataType.DECIMAL(10, 2))
  amount: number;

  @AllowNull(true)
  @Column
  contractNumber: string;

  @AllowNull(true)
  @Column
  dueDate: Date;

  @Default("pending")
  @Column
  status: string;

  @AllowNull(true)
  @Column
  fileUrl: string;

  @AllowNull(true)
  @Column
  notes: string;

  @AllowNull(true)
  @Column(DataType.JSON)
  paymentHistory: any;

  @ForeignKey(() => Contact)
  @AllowNull(true)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Ticket)
  @AllowNull(true)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Charge;
