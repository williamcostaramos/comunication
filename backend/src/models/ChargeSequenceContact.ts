import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  Default,
  DataType,
  AllowNull
} from "sequelize-typescript";
import ChargeSequence from "./ChargeSequence";
import Contact from "./Contact";
import Charge from "./Charge";

@Table
class ChargeSequenceContact extends Model<ChargeSequenceContact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default(0)
  @Column(DataType.INTEGER)
  ack: number; // status de entrega da última mensagem

  @Default(0)
  @Column(DataType.INTEGER)
  sendCount: number; // quantas vezes foi enviado

  @Default(false)
  @Column(DataType.BOOLEAN)
  stopCharging: boolean; // marca para não receber mais cobranças

  @Column(DataType.TEXT)
  reason: string | null; // motivo da parada (pago, desistiu, etc)

  @Column(DataType.DATE)
  lastSentAt: Date | null; // última vez que recebeu mensagem

  @Column(DataType.DATE)
  lastAckAt: Date | null; // última atualização de ACK

  @ForeignKey(() => Charge)
  @Column
  chargeId: number;

  @BelongsTo(() => Charge, "chargeId")
  charge: Charge;

  @ForeignKey(() => ChargeSequence)
  @Column
  chargeSequenceId: number;

  @BelongsTo(() => ChargeSequence, "chargeSequenceId")
  chargeSequence: ChargeSequence;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ChargeSequenceContact;
