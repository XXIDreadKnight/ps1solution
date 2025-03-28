"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const flashcards_1 = require("../src/flashcards");
const algorithm_1 = require("../src/algorithm");
// Helper function to create a flashcard
function createFlashcard(front, back, hint = "", tags = []) {
    return new flashcards_1.Flashcard(front, back, hint, tags);
}
describe("toBucketSets()", () => {
    it("should convert a BucketMap to an Array of Sets", () => {
        const buckets = new Map([
            [0, new Set([createFlashcard("Q1", "A1")])],
            [1, new Set([createFlashcard("Q2", "A2")])],
        ]);
        const result = (0, algorithm_1.toBucketSets)(buckets);
        assert_1.default.strictEqual(result.length, 2);
        // Ensure result[0] and result[1] are not undefined before accessing them
        (0, assert_1.default)(result[0] && result[0].size === 1); // Should have one card in bucket 0
        (0, assert_1.default)(result[1] && result[1].size === 1); // Should have one card in bucket 1
    });
    it("should handle empty buckets", () => {
        const buckets = new Map();
        const result = (0, algorithm_1.toBucketSets)(buckets);
        assert_1.default.strictEqual(result.length, 1); // At least one empty set should be there
        (0, assert_1.default)(result[0] && result[0].size === 0); // Ensure the first set is empty
    });
});
describe("getBucketRange()", () => {
    it("should return the correct range of buckets", () => {
        const buckets = [
            new Set([createFlashcard("Q1", "A1")]),
            new Set(),
            new Set([createFlashcard("Q2", "A2")]),
        ];
        const result = (0, algorithm_1.getBucketRange)(buckets);
        // Ensure result is not undefined before accessing
        (0, assert_1.default)(result && result.minBucket === 0);
        (0, assert_1.default)(result && result.maxBucket === 2);
    });
    it("should return undefined if no cards exist", () => {
        const buckets = [new Set(), new Set()];
        const result = (0, algorithm_1.getBucketRange)(buckets);
        assert_1.default.strictEqual(result, undefined);
    });
});
describe("practice()", () => {
    it("should return an empty set when all buckets are empty", () => {
        const buckets = [new Set(), new Set()];
        assert_1.default.deepStrictEqual((0, algorithm_1.practice)(buckets, 0), new Set());
    });
    it("should return cards from the correct bucket based on day", () => {
        const card1 = new flashcards_1.Flashcard("F1", "B1", "Hint", []);
        const card2 = new flashcards_1.Flashcard("F2", "B2", "Hint", []);
        // Explicitly typing Set<Flashcard> for each bucket
        const buckets = [
            new Set([card1]), // Bucket 0 contains card1
            new Set(), // Bucket 1 is empty
            new Set([card2]) // Bucket 2 contains card2
        ];
        assert_1.default.deepStrictEqual((0, algorithm_1.practice)(buckets, 0), new Set([card1])); // Cards from bucket 0
        assert_1.default.deepStrictEqual((0, algorithm_1.practice)(buckets, 2), new Set([card2])); // Cards from bucket 2
    });
    it("should not return cards if day does not match bucket interval", () => {
        const card = new flashcards_1.Flashcard("Front", "Back", "Hint", []);
        const buckets = [
            new Set(), // Bucket 0 is empty
            new Set([card]) // Bucket 1 contains card
        ];
        // At day 0, no cards should be returned
        assert_1.default.deepStrictEqual((0, algorithm_1.practice)(buckets, 0), new Set());
        // At day 1, card from bucket 1 should be returned
        assert_1.default.deepStrictEqual((0, algorithm_1.practice)(buckets, 1), new Set([card]));
    });
});
describe("update()", () => {
    it("should correctly update the bucket after a practice trial", () => {
        const buckets = new Map([
            [0, new Set([createFlashcard("Q1", "A1")])],
        ]);
        const card = createFlashcard("Q1", "A1");
        const updatedBuckets = (0, algorithm_1.update)(buckets, card, flashcards_1.AnswerDifficulty.Easy);
        const bucket1 = updatedBuckets.get(1); // Card should move to bucket 1
        // Check that the card is in the updated bucket
        (0, assert_1.default)(bucket1 && bucket1.has(card));
    });
    it("should reset the card to bucket 0 if marked as 'Wrong'", () => {
        const buckets = new Map([
            [1, new Set([createFlashcard("Q1", "A1")])],
        ]);
        const card = createFlashcard("Q1", "A1");
        const updatedBuckets = (0, algorithm_1.update)(buckets, card, flashcards_1.AnswerDifficulty.Wrong);
        const bucket0 = updatedBuckets.get(0); // Card should move to bucket 0
        // Check that the card is in bucket 0
        (0, assert_1.default)(bucket0 && bucket0.has(card));
    });
});
describe("getHint()", () => {
    it("should return a hint if available", () => {
        const card = createFlashcard("Q1", "A1", "This is a hint");
        const result = (0, algorithm_1.getHint)(card);
        assert_1.default.strictEqual(result, "Hint: This is a hint");
    });
    it("should return 'No hint available' if no hint is provided", () => {
        const card = createFlashcard("Q1", "A1");
        const result = (0, algorithm_1.getHint)(card);
        assert_1.default.strictEqual(result, "No hint available");
    });
});
describe("computeProgress()", () => {
    it("should compute mastery progress", () => {
        const buckets = new Map([
            [0, new Set([createFlashcard("Q1", "A1")])],
            [1, new Set([createFlashcard("Q2", "A2")])],
            [3, new Set([createFlashcard("Q3", "A3")])],
        ]);
        const history = [
            { card: createFlashcard("Q1", "A1"), difficulty: flashcards_1.AnswerDifficulty.Easy },
            { card: createFlashcard("Q2", "A2"), difficulty: flashcards_1.AnswerDifficulty.Hard },
            { card: createFlashcard("Q3", "A3"), difficulty: flashcards_1.AnswerDifficulty.Easy },
        ];
        const result = (0, algorithm_1.computeProgress)(buckets, history);
        assert_1.default.strictEqual(result.totalCards, 3);
        assert_1.default.strictEqual(result.masteredCards, 1); // Only bucket 3 should count as mastered
        assert_1.default.strictEqual(result.masteryPercentage, 33.33); // (1 mastered / 3 total) * 100
    });
});
