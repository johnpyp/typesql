import assert from "assert";
import { SchemaDef } from "../../src/types";
import { isLeft } from "fp-ts/lib/Either";
import { parseSql } from "../../src/sqlite-query-analyzer/parser";
import { sqliteDbSchema } from "../mysql-query-analyzer/create-schema";

describe('sqlite-parse-select-multiples-tables', () => {

	it.only('parse a basic with inner join', async () => {

		//mytable1 (id, value); mytable2 (id, name, descr)
		const sql = `
        SELECT * 
        FROM mytable1 t1 
        INNER JOIN mytable2 t2 on t2.id = t1.id
        `
		const actual = await parseSql(sql, sqliteDbSchema);
		const expected: SchemaDef = {
			sql,
			queryType: 'Select',
			multipleRowsResult: true,
			columns: [
				{
					columnName: 'id',
					type: 'INTEGER',
					notNull: true,
					table: 'T1'
				},
				{
					columnName: 'value',
					type: 'INTEGER',
					notNull: false,
					table: 'T1'
				},
				{
					columnName: 'id', //TODO - rename fields
					type: 'INTEGER',
					notNull: true,
					table: 'T2'
				},
				{
					columnName: 'name',
					type: 'TEXT',
					notNull: false,
					table: 'T2'
				},
				{
					columnName: 'descr',
					type: 'TEXT',
					notNull: false,
					table: 'T2'
				}
			],
			parameters: []

		}
		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	});
});