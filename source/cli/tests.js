import tests from "@/tests"

import { create_debug, create_info } from "@/logger";

const debug = create_debug(import.meta.file);
const info = create_info(import.meta.file);

const result = await tests.database.query.create.types.domain();
info(`tests.database.query.create.types.domain(): ${result}`);