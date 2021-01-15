import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Email_check {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  id: string;

  @Column()
  email: string;

  @Column()
  code: number;

  @Column()
  email_check: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date: string;
}