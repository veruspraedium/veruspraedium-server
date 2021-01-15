import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Admin {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  name: string;

  @Column()
  id: string;

  @Column()
  password: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date: string;
}