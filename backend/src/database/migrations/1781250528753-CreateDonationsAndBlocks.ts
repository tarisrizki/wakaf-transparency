import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDonationsAndBlocks1781250528753 implements MigrationInterface {
  name = 'CreateDonationsAndBlocks1781250528753';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blocks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "block_index" integer NOT NULL, "previous_hash" character varying(64) NOT NULL, "hash" character varying(64) NOT NULL, "data" jsonb NOT NULL, "action" character varying(100) NOT NULL, "actor" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8244fa1495c4e9222a01059244b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."donations_type_enum" AS ENUM('in', 'out')`,
    );
    await queryRunner.query(
      `CREATE TABLE "donations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "donor_name" character varying(200) NOT NULL, "amount" numeric(15,2) NOT NULL, "type" "public"."donations_type_enum" NOT NULL, "description" character varying(500), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c01355d6f6f50fc6d1b4a946abf" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "donations"`);
    await queryRunner.query(`DROP TYPE "public"."donations_type_enum"`);
    await queryRunner.query(`DROP TABLE "blocks"`);
  }
}
