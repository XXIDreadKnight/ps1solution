import assert from "assert";
import { Flashcard, AnswerDifficulty, BucketMap } from "../src/flashcards";
import {
  toBucketSets,
  getBucketRange,
  practice,
  update,
  getHint,
  computeProgress,
} from "../src/algorithm";

// Helper function to create a flashcard
function createFlashcard(front: string, back: string, hint: string = "", tags: string[] = []): Flashcard {
  return new Flashcard(front, back, hint, tags);
}

describe("toBucketSets()", () => {
  it("should convert a BucketMap to an Array of Sets", () => {
    const buckets: BucketMap = new Map([
      [0, new Set([createFlashcard("Q1", "A1")])],
      [1, new Set([createFlashcard("Q2", "A2")])],
    ]);

    const result = toBucketSets(buckets);
    assert.strictEqual(result.length, 2);
    
    // Ensure result[0] and result[1] are not undefined before accessing them
    assert(result[0] && result[0].size === 1); // Should have one card in bucket 0
    assert(result[1] && result[1].size === 1); // Should have one card in bucket 1
  });

  it("should handle empty buckets", () => {
    const buckets: BucketMap = new Map();
    const result = toBucketSets(buckets);
    assert.strictEqual(result.length, 1); // At least one empty set should be there
    assert(result[0] && result[0].size === 0); // Ensure the first set is empty
  });
});

describe("getBucketRange()", () => {
  it("should return the correct range of buckets", () => {
    const buckets: Array<Set<Flashcard>> = [
      new Set([createFlashcard("Q1", "A1")]),
      new Set(),
      new Set([createFlashcard("Q2", "A2")]),
    ];

    const result = getBucketRange(buckets);
    
    // Ensure result is not undefined before accessing
    assert(result && result.minBucket === 0);
    assert(result && result.maxBucket === 2);
  });

  it("should return undefined if no cards exist", () => {
    const buckets: Array<Set<Flashcard>> = [new Set(), new Set()];
    const result = getBucketRange(buckets);
    assert.strictEqual(result, undefined);
  });
});

describe("practice()", () => {
  it("should return an empty set when all buckets are empty", () => {
    const buckets: Set<Flashcard>[] = [new Set<Flashcard>(), new Set<Flashcard>()];
    assert.deepStrictEqual(practice(buckets, 0), new Set<Flashcard>());
  });

  it("should return cards from the correct bucket based on day", () => {
    const card1 = new Flashcard("F1", "B1", "Hint", []);
    const card2 = new Flashcard("F2", "B2", "Hint", []);

    // Explicitly typing Set<Flashcard> for each bucket
    const buckets: Set<Flashcard>[] = [
      new Set<Flashcard>([card1]),  // Bucket 0 contains card1
      new Set<Flashcard>(),         // Bucket 1 is empty
      new Set<Flashcard>([card2])   // Bucket 2 contains card2
    ];

    assert.deepStrictEqual(practice(buckets, 0), new Set<Flashcard>([card1]));  // Cards from bucket 0
    assert.deepStrictEqual(practice(buckets, 2), new Set<Flashcard>([card2]));  // Cards from bucket 2
  });

  it("should not return cards if day does not match bucket interval", () => {
    const card = new Flashcard("Front", "Back", "Hint", []);
    const buckets: Set<Flashcard>[] = [
      new Set<Flashcard>(),        // Bucket 0 is empty
      new Set<Flashcard>([card])   // Bucket 1 contains card
    ];

    // At day 0, no cards should be returned
    assert.deepStrictEqual(practice(buckets, 0), new Set<Flashcard>());
    
    // At day 1, card from bucket 1 should be returned
    assert.deepStrictEqual(practice(buckets, 1), new Set<Flashcard>([card]));
  });
});

describe("update()", () => {
  it("should correctly update the bucket after a practice trial", () => {
    const buckets: BucketMap = new Map([
      [0, new Set([createFlashcard("Q1", "A1")])],
    ]);

    const card = createFlashcard("Q1", "A1");
    const updatedBuckets = update(buckets, card, AnswerDifficulty.Easy);
    const bucket1 = updatedBuckets.get(1); // Card should move to bucket 1

    // Check that the card is in the updated bucket
    assert(bucket1 && bucket1.has(card));
  });

  it("should reset the card to bucket 0 if marked as 'Wrong'", () => {
    const buckets: BucketMap = new Map([
      [1, new Set([createFlashcard("Q1", "A1")])],
    ]);

    const card = createFlashcard("Q1", "A1");
    const updatedBuckets = update(buckets, card, AnswerDifficulty.Wrong);
    const bucket0 = updatedBuckets.get(0); // Card should move to bucket 0

    // Check that the card is in bucket 0
    assert(bucket0 && bucket0.has(card));
  });
});

describe("getHint()", () => {
  it("should return a hint if available", () => {
    const card = createFlashcard("Q1", "A1", "This is a hint");
    const result = getHint(card);
    assert.strictEqual(result, "Hint: This is a hint");
  });

  it("should return 'No hint available' if no hint is provided", () => {
    const card = createFlashcard("Q1", "A1");
    const result = getHint(card);
    assert.strictEqual(result, "No hint available");
  });
});

describe("computeProgress()", () => {
  it("should compute mastery progress", () => {
    const buckets: BucketMap = new Map([
      [0, new Set([createFlashcard("Q1", "A1")])],
      [1, new Set([createFlashcard("Q2", "A2")])],
      [3, new Set([createFlashcard("Q3", "A3")])],
    ]);

    const history = [
      { card: createFlashcard("Q1", "A1"), difficulty: AnswerDifficulty.Easy },
      { card: createFlashcard("Q2", "A2"), difficulty: AnswerDifficulty.Hard },
      { card: createFlashcard("Q3", "A3"), difficulty: AnswerDifficulty.Easy },
    ];

    const result = computeProgress(buckets, history);
    assert.strictEqual(result.totalCards, 3);
    assert.strictEqual(result.masteredCards, 1); // Only bucket 3 should count as mastered
    assert.strictEqual(result.masteryPercentage, 33.33); // (1 mastered / 3 total) * 100
  });
});
