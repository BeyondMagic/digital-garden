import { create_info, create_warn, create_debug, create_error, create_critical } from "@/logger";

const info = create_info(import.meta.file);
const warn = create_warn(import.meta.file);
const debug = create_debug(import.meta.file);
const make_error = create_error(import.meta.file);
const critical = create_critical(import.meta.file);

/**
 * Recursively run all test functions found in an object tree.
 * A "test function" is any function value (sync or async). Nested objects are treated as groups.
 * @param {Record<string, any>} suite
 * @param {{ bail?: boolean }} [options]
 * @returns {Promise<{ passed: number, failed: number, total: number }>}
 */
export async function run_test_tree(suite, options = {}) {
	const bail = !!options.bail;
	/** @type {{ passed: number, failed: number, total: number }} */
	const stats = { passed: 0, failed: 0, total: 0 };

	/**
	 * @param {any} node
	 * @param {string[]} path
	 */
	const visit = async (node, path) => {
		if (node && typeof node === "object" && !Array.isArray(node)) {
			for (const key of Object.keys(node)) {
				await visit(node[key], path.concat(key));
				if (bail && stats.failed > 0) return; // early exit on first failure
			}
			return;
		}

		if (typeof node === "function") {
			const name = path.join(" /");
			stats.total += 1;
			const start = performance.now();
			try {
				const result = node();
				if (result && typeof result.then === "function") await result;
				const dur = performance.now() - start;
				info(`✓ ${name} (${dur.toFixed(1)}ms)`);
				stats.passed += 1;
			} catch (e) {
				const dur = performance.now() - start;
				const err = e instanceof Error ? e : make_error(String(e));
				critical(`✗ ${name} (${dur.toFixed(1)}ms)`);
				console.error(err);
				stats.failed += 1;
			}
			return;
		}
	};

	await visit(suite, []);
	return stats;
}

/**
 * Pretty-print a summary and set exit code.
 * @param {{ passed: number, failed: number, total: number }} stats
 */
export function report_and_exit(stats) {
	const { passed, failed, total } = stats;
	const summary = `\nSummary: ${passed}/${total} passed, ${failed} failed`;
	if (failed > 0) {
		critical(summary);
		process.exitCode = 1;
	} else {
		info(summary);
	}
}
