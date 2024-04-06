import assert from "assert";
import { ParameterDef, SchemaDef } from "../../src/types";
import { isLeft } from "fp-ts/lib/Either";
import { parseSql } from "../../src/sqlite-query-analyzer/parser";
import { sqliteDbSchema } from "../mysql-query-analyzer/create-schema";

describe.only('sqlite-parse-params', () => {

    it('SELECT * from mytable1 where id > ?', async () => {
        const sql = `
        SELECT * from mytable1 where id > ?
        `
        const actual = await parseSql(sql, sqliteDbSchema);
        const expected: ParameterDef[] = [
            {
                name: 'param1',
                columnType: 'INTEGER',
                notNull: true
            }
        ]
        if (isLeft(actual)) {
            assert.fail(`Shouldn't return an error`);
        }
        assert.deepStrictEqual(actual.right.parameters, expected);
    })
});