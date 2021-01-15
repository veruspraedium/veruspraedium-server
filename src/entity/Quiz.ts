import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Quiz {

  @PrimaryGeneratedColumn()
  num: number;

  @Column()
  category: string;

  @Column()
  makeid: string;

  @Column()
  name: string;

  @Column()
  content: string;

  @Column()
  file: string;

  @Column()
  point: number;

  @Column()
  flag: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP"})
  date: string;
}