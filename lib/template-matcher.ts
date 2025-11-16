import stringSimilarity from 'string-similarity';

export interface Template {
  id: string;
  filename: string;
  keywords: string;
  mode: string;
  mood: string;
  storageUrl: string;
}

export interface MatchResult {
  template: Template;
  score: number;
  matchedKeywords: string[];
}

export function matchTemplate(userStory: string, mode: string, templates: Template[]): MatchResult | null {
  if (!templates || templates.length === 0) {
    return null;
  }

  const storyLower = userStory.toLowerCase();
  const storyWords = storyLower.split(/\s+/).filter(word => word.length > 3);
  
  const modeTemplates = templates.filter(t => t.mode.toLowerCase() === mode.toLowerCase());
  const templatesToSearch = modeTemplates.length > 0 ? modeTemplates : templates;

  let bestMatch: MatchResult | null = null;
  let highestScore = 0;

  for (const template of templatesToSearch) {
    const templateKeywords = template.keywords.toLowerCase().split(',').map(k => k.trim());
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of templateKeywords) {
      if (storyLower.includes(keyword)) {
        score += 10;
        matchedKeywords.push(keyword);
      } else {
        const similarities = storyWords.map(word => 
          stringSimilarity.compareTwoStrings(word, keyword)
        );
        const maxSimilarity = Math.max(...similarities, 0);
        if (maxSimilarity > 0.7) {
          score += maxSimilarity * 5;
          matchedKeywords.push(keyword);
        }
      }
    }

    if (template.mode.toLowerCase() === mode.toLowerCase()) {
      score += 5;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = {
        template,
        score,
        matchedKeywords
      };
    }
  }

  return bestMatch && highestScore > 2 ? bestMatch : null;
}

export function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'was'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  const wordFreq: { [key: string]: number } = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}
