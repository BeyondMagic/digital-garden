/*
 * SPDX-FileCopyrightText: 2025 João V. Farias (beyondmagic) <beyondmagic@mail.ru>
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Signature for debug function.
 * @typedef { (message: any, options?: { step: { max: number, current: number } }) => void } DebugFunction
 */

/**
 * Signature for error function.
 * @typedef { (message: any) => Error } ErrorFunction
 */

/**
 * Signature for assert function that narrows to a truthy value.
 * @typedef { (condition: unknown, msg?: string) => asserts condition } AssertFunction
 */

/**
 * Signature for generic log functions like info/warn/critical.
 * @typedef { (message: any, options?: { step: { max: number, current: number } }) => void } LogFunction
 */