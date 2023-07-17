# Select distinct example:

The following SQL in the file `select-customer-states.sql`:

```sql
SELECT DISTINCT
    state, city
FROM
    customers
ORDER BY 
    state, 
    city
```

Can be executed using the generated code:

```ts
import { createConnection } from "mysql2/promise";
import { selectCustomerStates } from "./sqls";

const conn = await createConnection({
    host: 'localhost',
    database: 'classicmodels',
    user: 'root',
    password: 'password'
});

const result = await selectCustomerStates(conn);
console.log("result=", result);
```