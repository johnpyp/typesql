import { DynamicSqlInfo, DynamicSqlInfoResult, FragmentInfo, FragmentInfoResult, TableField } from "./mysql-query-analyzer/types";

export function describeDynamicQuery(dynamicQueryInfo: DynamicSqlInfo, namedParameters: string[]): DynamicSqlInfoResult {
    const { select, from, where } = dynamicQueryInfo;

    const selectFragments = select.map(fragment => {
        const fragmentResult: FragmentInfoResult = {
            fragment: fragment.fragment,
            dependOnFields: fragment.fields.map(f => f.name),
            dependOnParams: []
        }
        return fragmentResult;
    });
    const fromFragements = from.map(fragment => {

        if (fragment.relation) {
            addAllChildFields(fragment, from);
        }

        const filteredWhere = where.filter(whereFragment => includeAny(whereFragment.fields, fragment.fields));
        const hasUnconditional = filteredWhere
            .some(fragment => fragment.dependOnParams.length == 0);

        if (hasUnconditional) {
            return {
                fragment: fragment.fragment,
                dependOnFields: [],
                dependOnParams: [],
            }
        }
        const selectedFields = select.flatMap(fragment => fragment.fields);

        const conditonalFields = fragment.fields
            .map(field => {
                const found = selectedFields.find(selected => field.field == selected.field && field.table == selected.table);
                if (found) {
                    return { ...field, name: found.name }
                }
                return null
            }).filter((field): field is TableField => field != null);

        const params = filteredWhere.flatMap(fragment => fragment.dependOnParams).map(paramIndex => namedParameters[paramIndex]);
        const fragmentResult: FragmentInfoResult = {
            fragment: fragment.fragment,
            dependOnFields: conditonalFields.map(f => f.name),
            dependOnParams: params
        }
        return fragmentResult;
    });

    const whereFragements = where.map(fragment => {

        const fragmentResult: FragmentInfoResult = {
            fragment: fragment.fragment,
            dependOnFields: [],
            dependOnParams: fragment.dependOnParams.map(paramIndex => namedParameters[paramIndex])
        }
        return fragmentResult
    })

    return {
        select: selectFragments,
        from: fromFragements,
        where: whereFragements
    };
}

function includeAny(fields: TableField[], fields2: TableField[]) {
    return fields.some(f => fields2.find(f2 => f2.field == f.field && f2.table == f.table));
}

function addAllChildFields(currentRelation: FragmentInfo, from: FragmentInfo[]) {
    from.forEach(fragment => {
        if (fragment.parentRelation == currentRelation.relation) {
            currentRelation.fields.push(...fragment.fields);
        }
    })
}