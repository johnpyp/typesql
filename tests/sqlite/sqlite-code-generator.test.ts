import assert from "assert";

import { readFileSync } from "fs";
import { generateCrud, generateTsCode } from "../../src/sqlite-query-analyzer/code-generator";
import { sqliteDbSchema } from "../mysql-query-analyzer/create-schema";
import Database from "better-sqlite3";
import { isLeft } from "fp-ts/lib/Either";
import { loadDbSchema } from "../../src/sqlite-query-analyzer/query-executor";

describe('sqlite-code-generator', () => {

	const db = new Database('./mydb.db');

	it('select01 - select id, name from mytable2 where id = ?', async () => {
		const sql = `select id, name from mytable2 where id = ?`;

		const actual = await generateTsCode(sql, 'select01', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/select01.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('select01-libsql - select id, name from mytable2 where id = ?', async () => {
		const sql = `select id, name from mytable2 where id = ?`;

		const actual = await generateTsCode(sql, 'select01', sqliteDbSchema, false, 'libsql');
		const expected = readFileSync('tests/sqlite/expected-code/select01-libsql.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('select02 - select without parameters', async () => {
		const sql = `select id from mytable1`;

		const actual = await generateTsCode(sql, 'select02', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/select02.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('select02-libsql - select without parameters', async () => {
		const sql = `select id from mytable1`;

		const actual = await generateTsCode(sql, 'select02', sqliteDbSchema, false, 'libsql');
		const expected = readFileSync('tests/sqlite/expected-code/select02-libsql.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('select03 - select with same parameter used twice', async () => {
		const sql = 'select id from mytable1 where id = :id or id = :id';

		const actual = await generateTsCode(sql, 'select03', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/select03.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('select04 - select with same parameter used twice', async () => {
		const sql = 'SELECT text_column FROM all_types WHERE date(text_column) = date(:date)';

		const actual = await generateTsCode(sql, 'select04', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/select04.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('insert01 - select with same parameter used twice', async () => {
		const sql = 'INSERT INTO mytable1(value) values(10)';

		const actual = await generateTsCode(sql, 'insert01', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/insert01.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('insert01-libsql - select with same parameter used twice', async () => {
		const sql = 'INSERT INTO mytable1(value) values(10)';

		const actual = await generateTsCode(sql, 'insert01', sqliteDbSchema, false, 'libsql');
		const expected = readFileSync('tests/sqlite/expected-code/insert01-libsql.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('insert02 - select with same parameter used twice', async () => {
		const sql = 'INSERT INTO mytable1(value) values(?)';

		const actual = await generateTsCode(sql, 'insert02', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/insert02.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('insert03-libsql - select with same parameter used twice', async () => {
		const sql = 'INSERT INTO mytable1(value) VALUES(:value) RETURNING *';

		const actual = await generateTsCode(sql, 'insert03', sqliteDbSchema, false, 'libsql');
		const expected = readFileSync('tests/sqlite/expected-code/insert03-libsql.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('update01 - UPDATE mytable1 SET value=? WHERE id=?', () => {
		const sql = 'UPDATE mytable1 SET value=? WHERE id=?';

		const actual = generateTsCode(sql, 'update01', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/update01.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('update01-libsql - UPDATE mytable1 SET value=? WHERE id=?', () => {
		const sql = 'UPDATE mytable1 SET value=? WHERE id=?';

		const actual = generateTsCode(sql, 'update01', sqliteDbSchema, false, 'libsql');
		const expected = readFileSync('tests/sqlite/expected-code/update01-libsql.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('delete01 - DELETE FROM mytable1 WHERE id=?', () => {
		const sql = 'DELETE FROM mytable1 WHERE id=?';

		const actual = generateTsCode(sql, 'delete01', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/delete01.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('delete01-libsql - DELETE FROM mytable1 WHERE id=?', () => {
		const sql = 'DELETE FROM mytable1 WHERE id=?';

		const actual = generateTsCode(sql, 'delete01', sqliteDbSchema, false, 'libsql');
		const expected = readFileSync('tests/sqlite/expected-code/delete01-libsql.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('crud-select01', () => {
		const actual = generateCrud('sqlite', 'Select', 'mytable1', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/crud-select01.ts.txt', 'utf-8').replace(/\r/gm, '');
		assert.deepStrictEqual(actual, expected);
	})

	it('crud-select01-libsql', () => {
		const actual = generateCrud('libsql', 'Select', 'mytable1', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/crud-select01-libsql.ts.txt', 'utf-8').replace(/\r/gm, '');
		assert.deepStrictEqual(actual, expected);
	})

	it('crud-insert01', () => {
		const actual = generateCrud('sqlite', 'Insert', 'mytable1', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/crud-insert01.ts.txt', 'utf-8').replace(/\r/gm, '');
		assert.deepStrictEqual(actual, expected);
	})

	it('crud-insert01-libsql', () => {
		const actual = generateCrud('libsql', 'Insert', 'mytable1', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/crud-insert01-libsql.ts.txt', 'utf-8').replace(/\r/gm, '');
		assert.deepStrictEqual(actual, expected);
	})

	it('crud-update01', () => {
		const actual = generateCrud('sqlite', 'Update', 'mytable1', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/crud-update01.ts.txt', 'utf-8').replace(/\r/gm, '');

		assert.deepStrictEqual(actual, expected);
	})

	it('crud-update01-libsql', () => {
		const actual = generateCrud('libsql', 'Update', 'mytable1', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/crud-update01-libsql.ts.txt', 'utf-8').replace(/\r/gm, '');

		assert.deepStrictEqual(actual, expected);
	})

	it('crud-delete01', () => {
		const actual = generateCrud('sqlite', 'Delete', 'mytable1', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/crud-delete01.ts.txt', 'utf-8').replace(/\r/gm, '');

		assert.deepStrictEqual(actual, expected);
	})

	it('crud-delete01-libsql', () => {
		const actual = generateCrud('libsql', 'Delete', 'mytable1', sqliteDbSchema);
		const expected = readFileSync('tests/sqlite/expected-code/crud-delete01-libsql.ts.txt', 'utf-8').replace(/\r/gm, '');

		assert.deepStrictEqual(actual, expected);
	})

	it('select05 - SELECT id FROM mytable1 ORDER BY ?', () => {
		const sql = 'SELECT id FROM mytable1 ORDER BY ?';

		const isCrud = false;
		const actual = generateTsCode(sql, 'select05', sqliteDbSchema, isCrud);
		const expected = readFileSync('tests/sqlite/expected-code/select05.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('select06 - SELECT id FROM mytable1 ORDER BY ?', () => {//
		const sql = `SELECT id
FROM mytable2
WHERE id IN (:ids)
AND name IN (:names)`;

		const isCrud = false;
		const actual = generateTsCode(sql, 'select06', sqliteDbSchema, isCrud);
		const expected = readFileSync('tests/sqlite/expected-code/select06.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('nested01 - FROM users u INNER JOIN posts p', () => {
		const sql = `-- @nested
SELECT 
	u.id as user_id, 
	u.name as user_name,
	p.id as post_id,
	p.title as post_title
FROM users u
INNER JOIN posts p on p.fk_user = u.id`

		const isCrud = false;
		const actual = generateTsCode(sql, 'nested01', sqliteDbSchema, isCrud);
		const expected = readFileSync('tests/sqlite/expected-code/nested01.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('nested02 - self relation', () => {
		const sql = `-- @nested
SELECT
	c.id,
	a1.*,
	a2.*
FROM clients as c
INNER JOIN addresses as a1 ON a1.id = c.primaryAddress
LEFT JOIN addresses as a2 ON a2.id = c.secondaryAddress
WHERE c.id = :clientId`

		const isCrud = false;
		const actual = generateTsCode(sql, 'nested02', sqliteDbSchema, isCrud);
		const expected = readFileSync('tests/sqlite/expected-code/nested-clients-with-addresses.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('nested03 - many to many', () => {
		const sql = `-- @nested
SELECT
	s.id as surveyId,
	s.name as surveyName,
	p.id as participantId,
	u.id as userId,
	u.name as userName
FROM surveys s
INNER JOIN participants p on p.fk_survey = s.id
INNER JOIN users u on u.id = p.fk_user`;

		const schemaResult = loadDbSchema(db);
		if (isLeft(schemaResult)) {
			assert.fail(`Shouldn't return an error`);
		}

		const isCrud = false;
		const actual = generateTsCode(sql, 'nested03', schemaResult.right, isCrud, 'libsql');
		const expected = readFileSync('tests/sqlite/expected-code/nested03-many-to-many.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})

	it('nested01-libsql - FROM users u INNER JOIN posts p', () => {
		const sql = `-- @nested
SELECT 
	u.id as user_id, 
	u.name as user_name,
	p.id as post_id,
	p.title as post_title
FROM users u
INNER JOIN posts p on p.fk_user = u.id`

		const isCrud = false;
		const actual = generateTsCode(sql, 'nested01', sqliteDbSchema, isCrud, 'libsql');
		const expected = readFileSync('tests/sqlite/expected-code/nested01-libsql.ts.txt', 'utf-8').replace(/\r/gm, '');

		if (isLeft(actual)) {
			assert.fail(`Shouldn't return an error`);
		}
		assert.deepStrictEqual(actual.right, expected);
	})
});