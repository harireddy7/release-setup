// GitHub Releases API maximum body length
const GITHUB_RELEASE_BODY_MAX_LENGTH = 125000;
const CHARS_PER_COMMIT = 200; // conservative estimate per rendered commit line

const branches = JSON.parse(process.env.RELEASE_BRANCHES || 'null') || [
  { name: 'main' },
  { name: 'dev', prerelease: 'dev' },
];

module.exports = {
  branches,
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      '@semantic-release/release-notes-generator',
      {
        writerOpts: {
          finalizeContext: (context) => {
            const maxCommits = Math.floor(GITHUB_RELEASE_BODY_MAX_LENGTH / CHARS_PER_COMMIT);
            const totalCommits = context.commitGroups.reduce((sum, g) => sum + g.commits.length, 0);

            if (totalCommits > maxCommits) {
              const ratio = maxCommits / totalCommits;
              context.commitGroups = context.commitGroups
                .map((group) => ({
                  ...group,
                  commits: group.commits.slice(0, Math.max(1, Math.floor(group.commits.length * ratio))),
                }))
                .filter((group) => group.commits.length > 0);
            }

            return context;
          },
        },
      },
    ],
    [
      '@semantic-release/github',
      {
        successCommentCondition: false,
        failComment: false,
      },
    ],
  ],
};
