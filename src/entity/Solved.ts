import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Solved {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  quiz_id: number;

  @Column()
  id: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
  date: string;
}