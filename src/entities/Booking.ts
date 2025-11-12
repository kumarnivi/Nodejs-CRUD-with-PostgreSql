import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Vehicle } from "./Vehicle";

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_nic!: string;

  @Column()
  category_type!: number;

  @Column("timestamp")
  rent_started_date!: Date;

  @Column("timestamp")
  rent_ended_date!: Date;

  @Column("float")
  total_payment!: number;

  @ManyToOne(() => User, user => user.bookings)
  user!: User;

  @ManyToOne(() => Vehicle, vehicle => vehicle.bookings)
  vehicle!: Vehicle;
}
