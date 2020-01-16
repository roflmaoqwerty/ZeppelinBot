import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBansTable1579087839584 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "timed_bans",
        columns: [
          {
            name: "guild_id",
            type: "bigint",
            unsigned: true,
            isPrimary: true,
          },
          {
            name: "user_id",
            type: "bigint",
            unsigned: true,
            isPrimary: true,
          },
          {
            name: "created_at",
            type: "datetime",
            isNullable: false,
            default: "now()",
          },
          {
            name: "expires_at",
            type: "datetime",
            isNullable: false,
          },
          {
            name: "case_id",
            type: "int",
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("timed_bans");
  }
}
