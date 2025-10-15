// Declare source tables
const src = {
  database: dataform.projectConfig.vars.source_project,
  schema: dataform.projectConfig.vars.source_dataset
};

// Product review pipeline sources
declare({ ...src, name: "Production_ProductReview" });
declare({ ...src, name: "Production_Product" });
declare({ ...src, name: "Production_ProductSubcategory" });
declare({ ...src, name: "Production_ProductCategory" });

