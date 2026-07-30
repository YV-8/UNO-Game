const COLORS = ['red', 'blue', 'yellow', 'green'];
const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACTION_VALUES = ['skip', 'reverse', 'draw_two'];
const WILD_VALUES = ['wild', 'wild_draw_four'];
//comodin = wild
// 0: 1 por color (4) | 1-9: 2 por color (72) | skip/reverse/draw_two: 2 por color (24)
// | wild/wild_draw_four: 4 de cada uno (8) = 108 cartas
//mayusculas == enums
export const buildDeck = () => {
    const deck = [];

    COLORS.forEach((color) => {
        deck.push({ color, value: '0' });
    });

    COLORS.forEach((color) => {
        NUMBERS.forEach((value) => {
            deck.push({ color, value });
            deck.push({ color, value });
        });
    });

    COLORS.forEach((color) => {
        ACTION_VALUES.forEach((value) => {
            deck.push({ color, value });
            deck.push({ color, value });
        });
    });

    WILD_VALUES.forEach((value) => {
        for (let i = 0; i < 4; i ++) {
            deck.push({ color: null, value });
        }
    });

    return deck;
};

// Fisher-Yates
export const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
//INVESTIGAR

//podria hacer de otra manera con diagramas
export const getCardPoints = (value) => {
    if (value === 'wild' || value === 'wild_draw_four') return 40;
    if (value === 'skip' || value === 'reverse' || value === 'draw_two') return 20;
    return Number(value);
};

const VALUE_LABELS = {
    skip: 'Skip',
    reverse: 'Reverse',
    draw_two: 'Draw Two',
    wild: 'Wild',
    wild_draw_four: 'Wild Draw Four',
};

const COLOR_LABELS = {
    red: 'Red',
    blue: 'Blue',
    yellow: 'Yellow',
    green: 'Green',
};


//INVESTIGAR
export const formatCard = (card) => {
    const cardValue = VALUE_LABELS[card.value] ?? card.value;
    if (!card.color) return cardValue;
    return `${COLOR_LABELS[card.color]} ${cardValue}`;
};