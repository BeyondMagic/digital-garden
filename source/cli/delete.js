import query from "@/database/query";
import { debug } from "@/util";

const prompt = "Are you sure you want to delete the database? (y/n) ";
process.stdout.write(prompt);

for await (const line of console) {
	const answer = line.trim().toLowerCase();

	switch (answer) {
		case "y":
			debug("Deleting database...");
			await query.remove.database();
			debug("Database deleted.");
			break;
		case "n":
			debug("Not deleting database.");
			break
		default:
			debug("Aborting...");
			break;
	}

	break;
}