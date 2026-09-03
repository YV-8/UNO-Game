export const CardEffects = {
    reverse: (state) => ({
        direction: state.direction * -1,
        skipNext: false,
        drawPenalty: 0,
    }),
    skip: (state) => ({
        direction: state.direction,
        skipNext: true,
        drawPenalty: 0,
    }),
    draw_two: (state) => ({
        direction: state.direction,
        skipNext: true,
        drawPenalty: 2,
    }),
    wild_draw_four: (state) => ({
        direction: state.direction,
        skipNext: true,
        drawPenalty: 4,
    }),
    standard: (state) => ({
        direction: state.direction,
        skipNext: false,
        drawPenalty: 0,
    }),
};
export const getCardEffect = (card) => {
    return CardEffects[card.value] || CardEffects.standard;
};