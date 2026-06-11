const predict = (caption = "") => {

    caption = caption.toLowerCase();

    // Animal
    if (
        caption.includes("animal") ||
        caption.includes("dog") ||
        caption.includes("cat") ||
        caption.includes("lion") ||
        caption.includes("tiger") ||
        caption.includes("elephant") ||
        caption.includes("pet") ||
        caption.includes("puppy")
    ) {
        return "animal";
    }

    // Sports
    if (
        caption.includes("sports") ||
        caption.includes("cricket") ||
        caption.includes("football") ||
        caption.includes("soccer") ||
        caption.includes("tennis") ||
        caption.includes("basketball") ||
        caption.includes("volleyball") ||
        caption.includes("match")
    ) {
        return "sports";
    }

    // Food
    if (
        caption.includes("food") ||
        caption.includes("pizza") ||
        caption.includes("burger") ||
        caption.includes("sandwich") ||
        caption.includes("cake") ||
        caption.includes("restaurant") ||
        caption.includes("cooking") ||
        caption.includes("recipe")
    ) {
        return "food";
    }

    // Travel
    if (
        caption.includes("travel") ||
        caption.includes("trip") ||
        caption.includes("vacation") ||
        caption.includes("journey") ||
        caption.includes("tour") ||
        caption.includes("beach") ||
        caption.includes("mountain") ||
        caption.includes("hotel")
    ) {
        return "travel";
    }

    // Technology
    if (
        caption.includes("technology") ||
        caption.includes("tech") ||
        caption.includes("coding") ||
        caption.includes("programming") ||
        caption.includes("computer") ||
        caption.includes("software") ||
        caption.includes("ai") ||
        caption.includes("machine learning")
    ) {
        return "technology";
    }

    // Education
    if (
        caption.includes("education") ||
        caption.includes("study") ||
        caption.includes("learning") ||
        caption.includes("college") ||
        caption.includes("school") ||
        caption.includes("course") ||
        caption.includes("tutorial") ||
        caption.includes("interview")
    ) {
        return "education";
    }

    // Music
    if (
        caption.includes("music") ||
        caption.includes("song") ||
        caption.includes("singer") ||
        caption.includes("guitar") ||
        caption.includes("piano") ||
        caption.includes("album") ||
        caption.includes("concert") ||
        caption.includes("rap")
    ) {
        return "music";
    }

    return "other";
};

module.exports = predict;