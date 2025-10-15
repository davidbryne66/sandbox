// Source table declarations
// Organized by deployment phase for incremental build

const src = {
  database: dataform.projectConfig.vars.source_project,
  schema: dataform.projectConfig.vars.source_dataset
};

// ===== Product Reviews =====
declare({ ...src, name: "Production_ProductReview" });
declare({ ...src, name: "Production_Product" });
declare({ ...src, name: "Production_ProductSubcategory" });
declare({ ...src, name: "Production_ProductCategory" });

// ===== Product Inventory =====
declare({ ...src, name: "Production_ProductInventory" });
declare({ ...src, name: "Production_Location" });

// ===== Purchases =====
declare({ ...src, name: "Purchasing_PurchaseOrderHeader" });
declare({ ...src, name: "Purchasing_PurchaseOrderDetail" });
declare({ ...src, name: "Purchasing_Vendor" });
declare({ ...src, name: "Purchasing_ShipMethod" });
declare({ ...src, name: "HumanResources_Employee" });
declare({ ...src, name: "Person_Person" });

// ===== Work Orders =====
declare({ ...src, name: "Production_WorkOrder" });
declare({ ...src, name: "Production_ScrapReason" });

// ===== Sales =====
declare({ ...src, name: "Sales_SalesOrderHeader" });
declare({ ...src, name: "Sales_SalesOrderDetail" });
declare({ ...src, name: "Sales_Customer" });
declare({ ...src, name: "Sales_Store" });
declare({ ...src, name: "Sales_SalesTerritory" });
declare({ ...src, name: "Sales_SalesPerson" });
declare({ ...src, name: "Sales_SpecialOffer" });
declare({ ...src, name: "Sales_SpecialOfferProduct" });
declare({ ...src, name: "Sales_CreditCard" });
declare({ ...src, name: "Sales_Currency" });
declare({ ...src, name: "Person_Address" });
declare({ ...src, name: "Person_StateProvince" });
declare({ ...src, name: "Person_CountryRegion" });
