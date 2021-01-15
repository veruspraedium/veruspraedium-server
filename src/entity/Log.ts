import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Log {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  name: string;

  @Column()
  id: string;

  @Column()
  contents: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  date: string;
}