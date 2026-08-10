const REPO = "dvshaoo/one_lgu";

export interface GithubCommit {
  sha: string;
  message: string;
  detail: string | null;
  date: string;
  author: string;
  url: string;
}

// Live commit history for the /system-info timeline. No-op (returns null,
// caller falls back to a static list) until GITHUB_TOKEN is set — the repo
// is private, so an unauthenticated call would just 404.
export async function fetchRecentCommits(limit = 15): Promise<GithubCommit[] | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/commits?sha=master&per_page=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        // Revalidate hourly rather than on every request — this is a
        // reference page, not a live dashboard.
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return null;

    const commits = await res.json();
    if (!Array.isArray(commits)) return null;

    return commits.map((c) => {
      const fullMessage: string = c.commit?.message || "";
      const [message, ...rest] = fullMessage.split("\n\n");
      return {
        sha: (c.sha as string).slice(0, 7),
        message: message.trim(),
        detail: rest.join("\n\n").trim() || null,
        date: c.commit?.author?.date || c.commit?.committer?.date || "",
        author: c.commit?.author?.name || "",
        url: c.html_url,
      };
    });
  } catch {
    // GitHub unreachable or rate-limited — fall back rather than break the page.
    return null;
  }
}
