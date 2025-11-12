import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Category } from "./Category";
import { Location } from "./Location";
import { Booking } from "./Booking";

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  number_plate_no!: string;

  @Column({ nullable: true })
  image?: string;

  @Column()
  condition_vehicle!: string;

  @Column("float")
  rent_per_day!: number;

  @Column({ default: "available" })
  availability_status!: string;

  @ManyToOne(() => Category, category => category.vehicles, { nullable: true })
  category?: Category;

  @ManyToOne(() => Location, location => location.vehicles, { nullable: true })
  location?: Location;

  @OneToMany(() => Booking, booking => booking.vehicle)
  bookings?: Booking[];
}
