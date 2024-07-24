import {AutoIncrement, Model, Column, CreatedAt, PrimaryKey, UpdatedAt, Table} from "sequelize-typescript";

@Table({timestamps: false})
class Feature extends Model<Feature> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  description: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Feature;
