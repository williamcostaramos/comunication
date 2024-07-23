
import {AutoIncrement,Model, Column, CreatedAt, PrimaryKey, UpdatedAt} from "sequelize-typescript";

class Role extends Model<Role> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
export default Role;
