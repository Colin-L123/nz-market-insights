import { describe, it, expect } from 'vitest'
import { formatDate, formatNumber } from './format'

describe('formatDate', () => {
    it('formats an ISO timestamp into a short readable date', () => {
        expect(formatDate('2026-08-01T02:29:47.837714')).toBe('1 Aug 2026')
    })
})

describe('formatNumber', () => {
    it('leaves whole numbers without decimal places', () => {
        expect(formatNumber(850000)).toBe('850,000')
    })

    it('adds thousands separators to large numbers', () => {
        expect(formatNumber(1234567)).toBe('1,234,567')
    })

    it('truncates to the given number of decimal places', () => {
        expect(formatNumber(3.456789, 2)).toBe('3.46')
    })

    it('does not pad short decimals with trailing zeros', () => {
        expect(formatNumber(1.7, 2)).toBe('1.7')
    })
})