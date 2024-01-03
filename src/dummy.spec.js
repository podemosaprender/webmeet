//INFO: how to write tests (.spec.js files)
//SEE: https://vitest.dev/guide/#writing-tests

import { expect, test } from 'vitest'
//U: import the functions you want to test

test('adds 1 + 2 to equal 3', () => {
	expect(1 + 2).toBe(4) //A: make the test fail to see the report
})
