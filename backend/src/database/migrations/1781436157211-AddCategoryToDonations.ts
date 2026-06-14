import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryToDonations1781436157211 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "donations" ADD "category" character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "donations" DROP COLUMN "category"`);
    }

}
