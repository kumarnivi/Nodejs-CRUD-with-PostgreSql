import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Vehicle } from "./Vehicle";

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => Vehicle, vehicle => vehicle.location)
  vehicles!: Vehicle[];
}
