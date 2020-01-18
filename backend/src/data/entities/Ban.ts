import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("timed_bans")
export class Ban {
  @Column()
  @PrimaryColumn()
  guild_id: string;

  @Column()
  @PrimaryColumn()
  user_id: string;

  @Column() created_at: string;

  @Column() expires_at: string;

  @Column() case_id: number;
}
