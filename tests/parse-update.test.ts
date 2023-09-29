import assert from "assert";
import { parseSql } from "../src/describe-query";
import { SchemaDef, ColumnDef } from "../src/types";
import { DbClient } from "../src/queryExectutor";
import { isLeft } from "fp-ts/lib/Either";

describe('parse update statements', () => {

    let client: DbClient = new DbClient();
    before(async () => {
        await client.connect('mysql://root:password@localhost/mydb');
    })

    after(async () => {
        await client.closeConnection();
    })

    const columns: ColumnDef[] = [
        {
            name: 'affectedRows',
            dbtype: 'int',
            notNull: true
        }
    ]

    it('update mytable1 set value = ? where id = ?', async () => {

        const sql = `
        update mytable1 set value = ? where id = ?
            `;
        const actual = await parseSql(client, sql);
        const expected: SchemaDef = {
            sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [
                {
                    name: 'value',
                    columnType: 'int',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'param1',
                    columnType: 'int',
                    notNull: true
                }
            ]
        }

        if (isLeft(actual)) {
            assert.fail(`Shouldn't return an error`);
        }
        assert.deepStrictEqual(actual.right, expected);
    })

    it('update mytable1 set value = :value where id > :min and id < :max', async () => {

        const sql = `
        update mytable1 set value = :value where id > :min and id < :max
            `;
        const expectedSql = `
        update mytable1 set value = ? where id > ? and id < ?
            `;
        const actual = await parseSql(client, sql);
        const expected: SchemaDef = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [
                {
                    name: 'value',
                    columnType: 'int',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'min',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'max',
                    columnType: 'int',
                    notNull: true
                }
            ]
        }

        if (isLeft(actual)) {
            assert.fail(`Shouldn't return an error`);
        }
        assert.deepStrictEqual(actual.right, expected);
    })

    it('update mytable1 set value = :value where id > :value or id < :value', async () => {

        const sql = `
        update mytable1 set value = :value where id > :value or id < :value
            `;
        const expectedSql = `
        update mytable1 set value = ? where id > ? or id < ?
            `;

        const actual = await parseSql(client, sql);
        const expected: SchemaDef = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [
                {
                    name: 'value',
                    columnType: 'int',
                    notNull: false
                }
            ],
            parameters: [
                {
                    name: 'value',
                    columnType: 'int',
                    notNull: true
                },
                {
                    name: 'value',
                    columnType: 'int',
                    notNull: true
                }
            ]
        }

        if (isLeft(actual)) {
            assert.fail(`Shouldn't return an error`);
        }
        assert.deepStrictEqual(actual.right, expected);
    })

    it('UPDATE mytable1 SET id = IFNULL(:id, id)', async () => {

        const sql = `
        UPDATE mytable1 SET id = IFNULL(:id, id)
            `;
        const expectedSql = `
        UPDATE mytable1 SET id = IFNULL(?, id)
            `;

        const actual = await parseSql(client, sql);
        const expected: SchemaDef = {
            sql: expectedSql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [
                {
                    name: 'id',
                    columnType: 'int',
                    notNull: false
                }
            ],
            parameters: []
        }

        if (isLeft(actual)) {
            assert.fail(`Shouldn't return an error`);
        }
        assert.deepStrictEqual(actual.right, expected);
    })

    it('UPDATE mytable1 t1 SET t1.value = 10 WHERE t1.id = 1', async () => {

        const sql = `
            UPDATE mytable1 t1
            SET t1.value = 10
            WHERE t1.id = 1`;

        const actual = await parseSql(client, sql);
        const expected: SchemaDef = {
            sql: sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [],
            parameters: []
        }

        if (isLeft(actual)) {
            assert.fail(`Shouldn't return an error: ` + actual.left.description);
        }
        assert.deepStrictEqual(actual.right, expected);
    })

    it('UPDATE mytable2 t2, mytable3 t3 SET t2.name = t3.name WHERE t2.id = t3.id', async () => {

        const sql = `
            UPDATE mytable2 t2, mytable3 t3
            SET t2.name = t3.name
            WHERE t2.id = t3.id`;

        const actual = await parseSql(client, sql);
        const expected: SchemaDef = {
            sql: sql,
            queryType: 'Update',
            multipleRowsResult: false,
            columns,
            data: [],
            parameters: []
        }

        if (isLeft(actual)) {
            assert.fail(`Shouldn't return an error: ` + actual.left.description);
        }
        assert.deepStrictEqual(actual.right, expected);
    })
})