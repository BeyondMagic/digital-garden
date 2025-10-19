import { remove } from "@/database/query/remove";
import { create } from "@/database/query/create";
import { reset } from "@/database/query/reset";

export const query = {
	create,
	remove,
	reset,
};