export function parseCardString(cardString) {
    if (!cardString) return null;
    const str = cardString.trim().toLowerCase().replace(/\s+/g, ' ');

    if (str === 'wild') return { color: null, value: 'wild' };
    if (str === 'wild draw four' || str === 'wild_draw_four') {
        return { color: null, value: 'wild_draw_four' };
    }

    const parts = str.split(' ');
    const color = parts[0]; // 'green', 'red', 'blue', 'yellow'
    const value = parts.slice(1).join('_'); // '7', 'skip', 'draw_two', etc.

    return { color, value };
}