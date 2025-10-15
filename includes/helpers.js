// Shared helper functions (add as needed during hackathon)

// Example: Source config shorthand
function sourceRef(tableName) {
  return {
    database: dataform.projectConfig.vars.source_project,
    schema: dataform.projectConfig.vars.source_dataset,
    name: tableName
  };
}

// Example: Standard assertions for dimensions
function dimAssertions(keyColumn, nameColumn) {
  return {
    uniqueKey: [keyColumn],
    nonNull: [keyColumn, nameColumn]
  };
}

module.exports = { sourceRef, dimAssertions };

