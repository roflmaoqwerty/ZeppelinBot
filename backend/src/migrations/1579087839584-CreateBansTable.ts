import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

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
            unsigned: true,
            isNullable: true,
            default: null,
          },
        ],
        indices: [
          {
            columnNames: ["expires_at", "case_id"],
            isUnique: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ["case_id"],
            referencedTableName: "cases",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable("timed_bans");
  }
}
