import { type Either, isLeft, left, right } from 'fp-ts/lib/Either';
import type { DatabaseClient, TypeSqlError } from '../types';
import type { ColumnSchema, Table } from '../mysql-query-analyzer/types';
import Database, { type Database as DatabaseType } from 'better-sqlite3';
import type { Database as LibSqlDatabase } from 'libsql';
import type { SQLiteType } from './types';

export function createSqliteClient(client: 'better-sqlite3' | 'bun:sqlite', databaseUri: string, attachList: string[]): Either<TypeSqlError, DatabaseClient> {
	const db = new Database(databaseUri);
	for (const attach of attachList) {
		db.exec(`attach database ${attach}`);
	}
	return right({
		type: client,
		client: db
	});
}

export function loadDbSchema(db: DatabaseType | LibSqlDatabase): Either<TypeSqlError, ColumnSchema[]> {
	const database_list = db
		//@ts-ignore
		.prepare('select name from pragma_database_list')
		.all()
		.map((col: any) => col.name) as string[];
	const result: ColumnSchema[] = [];
	for (const schema of database_list) {
		const schemaResult = loadDbSchemaForSchema(db, schema);
		if (isLeft(schemaResult)) {
			return schemaResult;
		}
		result.push(...schemaResult.right);
	}

	return right(result);
}

type TableInfo = {
	name: string;
	type: string;
	notnull: number;
	dflt_value: string;
	pk: number;
};

type TableAndType = {
	name: string;
	type: 'T' | 'VT'
}

export function getTableInfo(db: DatabaseType | LibSqlDatabase, schema: string, table: string): TableInfo[] {
	const tableInfo = db
		//@ts-ignore
		.prepare(`PRAGMA ${schema}.table_info('${table}')`)
		.all() as TableInfo[];
	return tableInfo;
}

export function getIndexInfo(db: DatabaseType | LibSqlDatabase, schema: string, table: string) {
	const map = new Map<string, true>();
	const indexList = db
		//@ts-ignore
		.prepare(`PRAGMA ${schema}.index_list('${table}')`)
		.all() as { name: string; unique: number }[];
	for (const index of indexList) {
		const indexedColumns = db
			//@ts-ignore
			.prepare(`PRAGMA ${schema}.index_info('${index.name}')`)
			.all()
			.map((res: any) => res.name) as string[];
		for (const column of indexedColumns) {
			map.set(column, true);
		}
	}
	return map;
}

export function getTables(db: DatabaseType | LibSqlDatabase, schema: string): TableAndType[] {
	const tables = db
		//@ts-ignore
		.prepare(`SELECT name, rootpage FROM ${schema}.sqlite_schema`)
		.all()
		.map((res: any) => ({ name: res.name, type: getTableType(res.rootpage) }));
	return tables;
}

function getTableType(rootpage: number | null): TableAndType['type'] {
	return rootpage != null && rootpage !== 0 ? 'T' : 'VT';
}

function checkAffinity(type: string): SQLiteType {
	if (type.includes('INT')) {
		return 'INTEGER';
	}
	if (type.includes('CHAR') || type.includes('CLOB') || type.includes('TEXT')) {
		return 'TEXT';
	}
	if (type === '' || type.includes('BLOB')) {
		return 'BLOB';
	}
	if (type.includes('REAL') || type.includes('FLOA') || type.includes('DOUB')) {
		return 'REAL';
	}
	return 'NUMERIC';
}

function loadDbSchemaForSchema(db: DatabaseType | LibSqlDatabase, schema: '' | string = ''): Either<TypeSqlError, ColumnSchema[]> {
	const tables = getTables(db, schema);

	const result = tables.flatMap(({ name, type }) => {
		const tableInfoList = getTableInfo(db, schema, name);
		const tableIndexInfo = getIndexInfo(db, schema, name);
		const columnSchema = tableInfoList.map((tableInfo) => {
			const isUni = tableIndexInfo.get(tableInfo.name) != null;
			const isVT = type == 'VT';
			const col: ColumnSchema = {
				column: tableInfo.name,
				column_type: isVT ? '?' : checkAffinity(tableInfo.type),
				columnKey: getColumnKey(tableInfo.pk, isUni, isVT),
				notNull: tableInfo.notnull === 1 || tableInfo.pk >= 1,
				schema,
				table: name
			};
			if (tableInfo.dflt_value != null) {
				col.defaultValue = tableInfo.dflt_value;
			}
			return col;
		});
		return columnSchema;
	});
	return right(result);
}

function getColumnKey(pk: number, isUni: boolean, isVT: boolean): ColumnSchema['columnKey'] {
	if (pk >= 1) {
		return 'PRI';
	}
	if (isUni) {
		return 'UNI';
	}
	if (isVT) {
		return 'VT';
	}
	return '';
}

export function selectSqliteTablesFromSchema(db: DatabaseType | LibSqlDatabase): Either<TypeSqlError, Table[]> {
	const sql = `
    SELECT 
		'' as schema,
		name as 'table'
	FROM sqlite_schema 
	WHERE type='table' 
	ORDER BY name
    `;

	try {
		//@ts-ignore
		const result = db.prepare(sql).all() as Table[];
		return right(result);
	} catch (e) {
		const err = e as Error;
		return left({
			name: err.name,
			description: err.message
		});
	}
}

export function explainSql(db: DatabaseType | LibSqlDatabase, sql: string): Either<TypeSqlError, boolean> {
	try {
		//@ts-ignore
		db.prepare(sql);
		return right(true);
	} catch (err_) {
		const err = err_ as Error;
		return left({
			name: err.name,
			description: err.message
		});
	}
}
