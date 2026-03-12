
import {AutoIncrement, Model, Column,  PrimaryKey,  Table} from "sequelize-typescript";
@Table({ timestamps: false })
class Role extends Model<Role> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

}
export default Role;
