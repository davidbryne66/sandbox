// Source table declarations
// Organized by deployment phase for incremental build

const src = {
  database: "dna-team-day-2025-20251003",
  schema: "team_day_2025_adventure_works_oltp"
};

// ===== Product Reviews =====
declare({ database: src.database, schema: src.schema, name: "Production_ProductReview" });
declare({ database: src.database, schema: src.schema, name: "Production_Product" });
declare({ database: src.database, schema: src.schema, name: "Production_ProductSubcategory" });
declare({ database: src.database, schema: src.schema, name: "Production_ProductCategory" });

// ===== Product Inventory =====
declare({ database: src.database, schema: src.schema, name: "Production_ProductInventory" });
declare({ database: src.database, schema: src.schema, name: "Production_Location" });

// ===== Purchases =====
declare({ database: src.database, schema: src.schema, name: "Purchasing_PurchaseOrderHeader" });
declare({ database: src.database, schema: src.schema, name: "Purchasing_PurchaseOrderDetail" });
declare({ database: src.database, schema: src.schema, name: "Purchasing_Vendor" });
declare({ database: src.database, schema: src.schema, name: "Purchasing_ShipMethod" });
declare({ database: src.database, schema: src.schema, name: "HumanResources_Employee" });
declare({ database: src.database, schema: src.schema, name: "Person_Person" });

// ===== Work Orders =====
declare({ database: src.database, schema: src.schema, name: "Production_WorkOrder" });
declare({ database: src.database, schema: src.schema, name: "Production_ScrapReason" });

// ===== Sales =====
declare({ database: src.database, schema: src.schema, name: "Sales_SalesOrderHeader" });
declare({ database: src.database, schema: src.schema, name: "Sales_SalesOrderDetail" });
declare({ database: src.database, schema: src.schema, name: "Sales_Customer" });
declare({ database: src.database, schema: src.schema, name: "Sales_Store" });
declare({ database: src.database, schema: src.schema, name: "Sales_SalesTerritory" });
declare({ database: src.database, schema: src.schema, name: "Sales_SalesPerson" });
declare({ database: src.database, schema: src.schema, name: "Sales_SpecialOffer" });
declare({ database: src.database, schema: src.schema, name: "Sales_SpecialOfferProduct" });
declare({ database: src.database, schema: src.schema, name: "Sales_CreditCard" });
declare({ database: src.database, schema: src.schema, name: "Sales_Currency" });
declare({ database: src.database, schema: src.schema, name: "Person_Address" });
declare({ database: src.database, schema: src.schema, name: "Person_StateProvince" });
declare({ database: src.database, schema: src.schema, name: "Person_CountryRegion" });
