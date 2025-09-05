// Test the Viber extension functionality
describe('Extension Test Suite', () => {
	test('Basic functionality test', () => {
		expect(true).toBe(true);
	});

	test('Array operations work correctly', () => {
		expect([1, 2, 3].indexOf(5)).toBe(-1);
		expect([1, 2, 3].indexOf(0)).toBe(-1);
		expect([1, 2, 3].indexOf(2)).toBe(1);
	});
});
