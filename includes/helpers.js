// Shared helper functions

// Source config shorthand
function sourceRef(tableName) {
  return {
    database: "dna-team-day-2025-20251003",
    schema: "team_day_2025_adventure_works_oltp",
    name: tableName
  };
}

// Standard assertions for dimensions
function dimAssertions(keyColumn, nameColumn) {
  return {
    uniqueKey: [keyColumn],
    nonNull: [keyColumn, nameColumn]
  };
}

module.exports = { sourceRef, dimAssertions };

