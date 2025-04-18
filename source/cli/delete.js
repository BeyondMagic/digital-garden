import { delete_database } from "@/database/queries";
import { debug } from "@/util";

const prompt = "Are you sure you want to delete the database? (y/n) ";
process.stdout.write(prompt);

for await (const line of console) {
	const answer = line.trim().toLowerCase();

	switch (answer) {
		case "y":
			debug("Deleting database...");
			await delete_database();
			debug("Database deleted.");
			break;
		case "n":
			debug("Not deleting database.");
		default:
			debug("Aborting...");
			break;
	}

	break;
}