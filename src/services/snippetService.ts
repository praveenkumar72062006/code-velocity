import { SupportedLanguage, CodeSnippet, CODE_SNIPPETS } from '../data/codeSnippets';

// Client-side + Backend dynamic snippet generator & fetcher
class DynamicSnippetService {
  private seenIds = new Set<string>();

  // Generate an algorithmic procedural snippet on the fly (0ms latency fallback)
  public generateProceduralSnippet(language: SupportedLanguage): CodeSnippet {
    const seed = Math.floor(Math.random() * 90000) + 10000;
    const staticPool = CODE_SNIPPETS.filter((s) => s.language === language);
    const baseTemplate = staticPool[Math.floor(Math.random() * staticPool.length)] || CODE_SNIPPETS[0];

    return {
      id: `${language}_dyn_${seed}`,
      language,
      title: `${baseTemplate.title} (Variation #${seed % 999})`,
      difficulty: baseTemplate.difficulty,
      filename: `${baseTemplate.filename.split('.')[0]}_${seed}.${baseTemplate.filename.split('.')[1]}`,
      description: `Dynamic algorithmic challenge: ${baseTemplate.description}`,
      code: baseTemplate.code,
    };
  }

  // Fetch a brand new, unique snippet from Vercel Serverless Backend (with client fallback)
  public async fetchUniqueSnippet(language: SupportedLanguage): Promise<CodeSnippet> {
    try {
      const res = await fetch(`/api/snippets?language=${language}&mode=single&seed=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.snippet) {
          this.seenIds.add(data.snippet.id);
          return data.snippet;
        }
      }
    } catch (_) {}

    // Fallback: pick unseen from static pool or procedurally generate
    const pool = CODE_SNIPPETS.filter((s) => s.language === language);
    const unseen = pool.filter((s) => !this.seenIds.has(s.id));
    if (unseen.length > 0) {
      const picked = unseen[Math.floor(Math.random() * unseen.length)];
      this.seenIds.add(picked.id);
      return picked;
    }

    return this.generateProceduralSnippet(language);
  }

  // Fetch a fresh batch of 5 brand new snippets from Vercel Serverless Backend
  public async fetchFreshBatch(language: SupportedLanguage, count = 5): Promise<CodeSnippet[]> {
    try {
      const res = await fetch(`/api/snippets?language=${language}&mode=batch&count=${count}&seed=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.snippets) && data.snippets.length > 0) {
          data.snippets.forEach((s: CodeSnippet) => this.seenIds.add(s.id));
          return data.snippets;
        }
      }
    } catch (_) {}

    // Fallback batch from pool + dynamic variations
    const pool = CODE_SNIPPETS.filter((s) => s.language === language);
    const batch: CodeSnippet[] = [];
    for (let i = 0; i < count; i++) {
      if (i < pool.length) {
        batch.push(pool[i]);
      } else {
        batch.push(this.generateProceduralSnippet(language));
      }
    }
    return batch;
  }
}

export const snippetService = new DynamicSnippetService();
