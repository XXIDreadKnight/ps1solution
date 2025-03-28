import { Flashcard, AnswerDifficulty, BucketMap } from "./flashcards";

export function toBucketSets(buckets: BucketMap): Array<Set<Flashcard>> {
  const maxBucket = Math.max(...buckets.keys(), 0);
  const bucketArray: Array<Set<Flashcard>> = Array.from(
    { length: maxBucket + 1 },
    () => new Set<Flashcard>()
  );

  for (const [bucket, flashcards] of buckets.entries()) {
    bucketArray[bucket] = flashcards ?? new Set(); // Ensure no undefined values
  }

  return bucketArray;
}

export function getBucketRange(
  buckets: Array<Set<Flashcard>>
): { minBucket: number; maxBucket: number } | undefined {
  let minBucket: number | undefined;
  let maxBucket: number | undefined;

  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i] && buckets[i]!.size > 0) {
      if (minBucket === undefined) minBucket = i;
      maxBucket = i;
    }
  }

  return minBucket !== undefined && maxBucket !== undefined
    ? { minBucket, maxBucket }
    : undefined;
}

export function practice(buckets: Array<Set<Flashcard>>, day: number): Set<Flashcard> {
  const result = new Set<Flashcard>();
  if (day < buckets.length && buckets[day]) {
    buckets[day].forEach(card => result.add(card));
  }
  return result;
}

export function update(
  buckets: BucketMap,
  card: Flashcard,
  difficulty: AnswerDifficulty
): BucketMap {
  let currentBucket: number | undefined;
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

  let newBucket =
    difficulty === AnswerDifficulty.Wrong
      ? 0
      : difficulty === AnswerDifficulty.Hard
      ? currentBucket
      : currentBucket + 1;

  if (!buckets.has(newBucket)) {
    buckets.set(newBucket, new Set());
  }
  buckets.get(newBucket)?.add(card);

  return buckets;
}

export function getHint(card: Flashcard): string {
  return card.hint.length > 0 ? `Hint: ${card.hint}` : "No hint available";
}

export function computeProgress(buckets: BucketMap, history: Array<{ card: Flashcard; difficulty: AnswerDifficulty }>): any {
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