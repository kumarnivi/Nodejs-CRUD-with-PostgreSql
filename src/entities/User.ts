import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm";
import { Booking } from "./Booking";

export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: "enum", enum: Role, default: Role.USER })
  role!: Role;

  @Column({ nullable: true })
  profileImage?: string;

  @OneToMany(() => Booking, booking => booking.user)
  bookings!: Booking[];

  // Add these for OTP functionality
 @Column({ type: 'varchar', nullable: true })
  otp?: string | null;

  @Column({ type: "timestamp", nullable: true })
  otp_expiry?: Date | null;
}
