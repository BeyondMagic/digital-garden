import sql_types from "@/database/sql/types.sql" with { type: "text" };
import sql_tables from "@/database/sql/tables.sql" with { type: "text" };
import sql_procedures from "@/database/sql/procedures.sql" with { type: "text" };
import sql_triggers from "@/database/sql/triggers.sql" with { type: "text" };

export default [
	[
		[ "sql_types", sql_types ],
		[ "sql_tables", sql_tables ],
		[ "sql_procedures", sql_procedures ],
		[ "sql_triggers", sql_triggers ]
	]
]