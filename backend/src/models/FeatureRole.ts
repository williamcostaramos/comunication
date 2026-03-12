import {BelongsTo, Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Role from "./Role";
import Feature from "./Feature";

@Table
class FeatureRole extends Model<FeatureRole> {

  @ForeignKey(() => Role)
  @Column
  roleId: number;

  @BelongsTo(() => Role)
  role: Role;

  @ForeignKey(() => Feature)
  @Column
  featureId: number;

  @BelongsTo(() => Feature)
  feature: Feature;
}

export default FeatureRole;
