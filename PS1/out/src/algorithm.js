"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBucketSets = toBucketSets;
exports.getBucketRange = getBucketRange;
exports.practice = practice;
exports.update = update;
exports.getHint = getHint;
exports.computeProgress = computeProgress;
const flashcards_1 = require("./flashcards");
function toBucketSets(buckets) {
    const maxBucket = Math.max(...buckets.keys(), 0);
    const bucketArray = Array.from({ length: maxBucket + 1 }, () => new Set());
    for (const [bucket, flashcards] of buckets.entries()) {
        bucketArray[bucket] = flashcards ?? new Set(); // Ensure no undefined values
    }
    return bucketArray;
}
function getBucketRange(buckets) {
    let minBucket;
    let maxBucket;
    for (let i = 0; i < buckets.length; i++) {
        if (buckets[i] && buckets[i].size > 0) {
            if (minBucket === undefined)
                minBucket = i;
            maxBucket = i;
        }
    }
    return minBucket !== undefined && maxBucket !== undefined
        ? { minBucket, maxBucket }
        : undefined;
}
function practice(buckets, day) {
    const result = new Set();
    if (day < buckets.length && buckets[day]) {
        buckets[day].forEach(card => result.add(card));
    }
    return result;
}
function update(buckets, card, difficulty) {
    let currentBucket;
    for (const [bucket, cards] of buckets) {
        if (cards.has(card)) {
            currentBucket = bucket;
            cards.delete(card);
            break;
        }
    }
    if (currentBucket === undefined) {
        currentBucket = 0;
    }
    let newBucket = difficulty === flashcards_1.AnswerDifficulty.Wrong
        ? 0
        : difficulty === flashcards_1.AnswerDifficulty.Hard
            ? currentBucket
            : currentBucket + 1;
    if (!buckets.has(newBucket)) {
        buckets.set(newBucket, new Set());
    }
    buckets.get(newBucket)?.add(card);
    return buckets;
}
function getHint(card) {
    return card.hint.length > 0 ? `Hint: ${card.hint}` : "No hint available";
}
function computeProgress(buckets, history) {
    let totalCards = 0;
    let masteredCards = 0;
    for (const [bucket, cards] of buckets) {
        totalCards += cards.size;
        if (bucket >= 3) {
            masteredCards += cards.size;
        }
    }
    const masteryPercentage = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0;
    return {
        totalCards,
        masteredCards,
        masteryPercentage: parseFloat(masteryPercentage.toFixed(2)), // Round to 2 decimal places
    };
}
