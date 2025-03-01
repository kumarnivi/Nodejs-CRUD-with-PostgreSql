import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

@Entity("users")
export class User extends BaseEntity {
  static password(password: any, password1: any) {
      throw new Error("Method not implemented.");
  }
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column()
  username: string | undefined;

  @Column({ unique: true })
  email: string | undefined;

  @Column()
  password: string | undefined;

  @Column({type:"enum",enum:Role, default:Role.USER})
  role:Role | undefined;

  @Column({ nullable: true })
  profileImage: string | undefined;
}

