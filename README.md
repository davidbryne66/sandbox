# Phase 3: Data Transformation with Dataform

## Problem Statement

Raw OLTP data from Adventure Works is normalized for transactional efficiency, not analytical queries. Tables have technical IDs, complex relationships, and missing business-friendly fields. **Goal:** Transform OLTP data into a star schema (fact and dimension tables) optimized for analytics in BigQuery.

---

## Deliverable

A Dataform project that transforms Adventure Works OLTP data into:
- **5 fact tables** for analytical metrics (sales, reviews, inventory, purchases, work orders)
- **14 dimension tables** for descriptive attributes (products, customers, dates, locations, etc.)
- **Clean, documented SQL transformations** using SQLX templates
- **Automated builds** via Google Cloud Dataform

**Technical Requirements:**
- Use Dataform v3 (workflow_settings.yaml, not deprecated dataform.json)
- Source from `team_day_2025_adventure_works_oltp` dataset
- Target to `team_4` dataset
- No assertion blocks (prevent extra validation tables)
- Proper dependencies for build ordering

---

## Solution

### Architecture

```
Source: Adventure Works OLTP (38 tables)
    ↓
Dataform Transformations (SQLX)
    ↓
Star Schema in BigQuery
    ├── 5 Fact Tables (transactional data)
    └── 14 Dimension Tables (descriptive data)
    ↓
Phase 4 (LookML Semantic Layer)
```

### Tables Created

**Fact Tables (5):**
1. **fct_sales** - Sales order line items (~121K rows)
   - Grain: One row per order line item
   - Keys: customer, product, territory, salesperson, dates, addresses
   - Metrics: line_total, order_quantity, unit_price, gross_profit

2. **fct_product_reviews** - Customer product reviews (4 rows)
   - Grain: One row per review
   - Keys: product, review_date
   - Metrics: rating, comment_length, sentiment

3. **fct_product_inventory** - Inventory snapshots (~1K rows)
   - Grain: One row per product-location-snapshot
   - Keys: product, location, snapshot_date
   - Metrics: quantity_on_hand, reorder_point, safety_stock

4. **fct_purchases** - Purchase order line items (~8K rows)
   - Grain: One row per PO line item
   - Keys: vendor, product, employee, ship_method, dates
   - Metrics: order_quantity, received_quantity, unit_price, line_total

5. **fct_work_orders** - Manufacturing work orders (~72K rows)
   - Grain: One row per work order
   - Keys: product, location, scrap_reason, dates
   - Metrics: order_qty, scrapped_qty, scrap_rate

**Dimension Tables (14):**
1. **dim_product** - Products, categories, subcategories
2. **dim_customer** - Customer demographics and locations
3. **dim_date** - Date dimension (2011-2014, all dates)
4. **dim_territory** - Sales territories and regions
5. **dim_salesperson** - Sales representatives
6. **dim_location** - Warehouses and facilities
7. **dim_vendor** - Suppliers and vendors
8. **dim_employee** - Employee information
9. **dim_ship_method** - Shipping methods
10. **dim_special_offer** - Promotions and discounts
11. **dim_credit_card** - Payment methods
12. **dim_currency** - Currency codes
13. **dim_address** - Geographic locations
14. **dim_scrap_reason** - Manufacturing defect reasons

### Key Transformations

**1. Surrogate Keys**
- Generated consistent integer keys for all dimensions
- Used DENSE_RANK() or ROW_NUMBER() for unique IDs
- Example: `product_key` instead of natural `ProductID`

**2. Denormalization**
- Flattened hierarchies (Category → Subcategory → Product)
- Joined descriptive fields into fact tables
- Pre-calculated common metrics

**3. Date Dimension**
- Generated complete date spine (2011-2014)
- Added calculated fields: year, quarter, month_name, day_name, is_weekend
- Date key format: YYYYMMDD (e.g., 20140315)

**4. Business Logic**
- Gross profit: (line_total - (unit_cost * order_quantity))
- Scrap rate: (scrapped_qty / order_qty)
- Stock status categories: Out of Stock, Low Stock, Medium Stock, Well Stocked
- Sentiment analysis for reviews

**5. Data Quality**
- NULL handling with COALESCE
- Type casting for consistency
- Descriptive labels and categories

### Dataform Structure

```
dataform/
├── workflow_settings.yaml          # Project configuration (v3 standard)
├── .gitignore                      # Exclude node_modules, .df-temp
├── definitions/
│   ├── staging/
│   │   └── sources.js             # Declare all 38 OLTP source tables
│   ├── dimensions/                 # 14 dimension .sqlx files
│   │   ├── dim_product.sqlx
│   │   ├── dim_customer.sqlx
│   │   ├── dim_date.sqlx
│   │   └── ... (11 more)
│   ├── facts/                      # 5 fact .sqlx files
│   │   ├── fct_sales.sqlx
│   │   ├── fct_product_reviews.sqlx
│   │   ├── fct_product_inventory.sqlx
│   │   ├── fct_purchases.sqlx
│   │   └── fct_work_orders.sqlx
│   └── views/                      # Optional helper views
├── includes/
│   └── helpers.js                  # Utility functions (if needed)
└── README.md                       # Dataform deployment instructions
```

### SQLX File Structure

**Example: dim_product.sqlx**
```sql
config {
  type: "table",
  schema: "team_4",
  description: "Product dimension with categories and subcategories",
  tags: ["dimension"]
}

SELECT
  DENSE_RANK() OVER (ORDER BY p.ProductID) AS product_key,
  p.ProductID AS product_id,
  p.Name AS product_name,
  p.ProductNumber AS product_number,
  pc.Name AS category_name,
  psc.Name AS subcategory_name,
  p.Color AS color,
  p.Size AS size,
  p.StandardCost AS standard_cost,
  p.ListPrice AS list_price
FROM ${ref("Production_Product")} p
LEFT JOIN ${ref("Production_ProductSubcategory")} psc ON p.ProductSubcategoryID = psc.ProductSubcategoryID
LEFT JOIN ${ref("Production_ProductCategory")} pc ON psc.ProductCategoryID = pc.ProductCategoryID
```

**Example: fct_sales.sqlx**
```sql
config {
  type: "table",
  schema: "team_4",
  description: "Sales fact table - order line items",
  tags: ["fact"],
  dependencies: ["dim_customer", "dim_product", "dim_territory", "dim_salesperson"]
}

SELECT
  sod.SalesOrderDetailID AS sales_order_detail_id,
  -- Foreign keys to dimensions
  dp.product_key,
  dc.customer_key,
  dt.territory_key,
  -- Metrics
  sod.LineTotal AS line_total,
  sod.OrderQty AS order_quantity,
  sod.UnitPrice AS unit_price,
  (sod.LineTotal - (p.StandardCost * sod.OrderQty)) AS gross_profit
FROM ${ref("Sales_SalesOrderDetail")} sod
JOIN ${ref("Sales_SalesOrderHeader")} soh ON sod.SalesOrderID = soh.SalesOrderID
JOIN ${ref("dim_product")} dp ON sod.ProductID = dp.product_id
JOIN ${ref("dim_customer")} dc ON soh.CustomerID = dc.customer_id
LEFT JOIN ${ref("dim_territory")} dt ON soh.TerritoryID = dt.territory_id
```

### Key Design Decisions

**1. Dataform v3 Standards**
- Use `workflow_settings.yaml` (not deprecated dataform.json)
- Explicit source declarations in sources.js
- No package.json or node_modules needed

**2. No Assertions**
- Removed assertion blocks from configs
- Prevents creation of extra validation tables
- Keeps dataset clean with only 19 target tables

**3. Build Dependencies**
- Dimensions build first (no dependencies)
- Facts depend on dimensions (explicit dependencies array)
- Proper build ordering via dependency graph

**4. Source References**
- Use ${ref("table_name")} for all table references
- Dataform handles fully qualified names
- Enables dependency tracking

**5. Incremental Builds**
- All tables are full refresh (type: "table")
- Suitable for POC and hackathon timeline
- Can be converted to incremental later

---

## Deployment

### Prerequisites
- Google Cloud project with Dataform enabled
- BigQuery dataset: `team_day_2025_adventure_works_oltp` (source)
- BigQuery dataset: `team_4` (target)
- Dataform repository created in Google Cloud Console

### Steps

1. **Create Dataform Repository:**
   - Go to BigQuery → Dataform in Google Cloud Console
   - Create new repository: "adventure_works"
   - Select region: us-central1
   - Create workspace: "dev"

2. **Upload Files:**
   - Copy all files from `dataform/` directory
   - Maintain folder structure exactly
   - Commit changes to Git

3. **Configure Settings:**
   - Verify `workflow_settings.yaml` has correct values:
     - defaultProject: `dna-team-day-2025-20251003`
     - defaultDataset: `team_4`
     - defaultLocation: `US`

4. **Run Compilation:**
   - Click "Start Compilation"
   - Should show 19 actions (5 facts + 14 dimensions)
   - Check for any compilation errors

5. **Execute Workflow:**
   - Click "Start Execution"
   - Dimensions build first, then facts
   - Monitor progress in execution log
   - Verify all 19 tables created in BigQuery

6. **Validate Results:**
   - Check BigQuery dataset `team_4`
   - Should see exactly 19 tables (no extra validation tables)
   - Query sample data from each table
   - Verify row counts match expectations

---

## Validation

### Row Counts (Expected)

| Table | Rows | Grain |
|-------|------|-------|
| fct_sales | ~121,317 | Order line item |
| fct_product_reviews | 4 | Review |
| fct_product_inventory | ~1,069 | Product-location-snapshot |
| fct_purchases | ~8,845 | PO line item |
| fct_work_orders | ~72,591 | Work order |
| dim_product | ~504 | Product |
| dim_customer | ~19,820 | Customer |
| dim_date | 1,461 | Date (2011-2014) |
| dim_territory | 10 | Territory |
| dim_salesperson | 17 | Sales rep |
| dim_location | 14 | Location |
| dim_vendor | 104 | Vendor |
| dim_employee | 290 | Employee |
| dim_ship_method | 5 | Ship method |
| dim_special_offer | 16 | Special offer |
| dim_credit_card | 19 | Credit card |
| dim_currency | 105 | Currency |
| dim_address | ~19,614 | Address |
| dim_scrap_reason | 16 | Scrap reason |

### Data Quality Checks

```sql
-- Check for duplicate keys in dimensions
SELECT product_key, COUNT(*)
FROM team_4.dim_product
GROUP BY product_key
HAVING COUNT(*) > 1;

-- Verify foreign key relationships
SELECT COUNT(*) AS orphaned_records
FROM team_4.fct_sales
WHERE product_key NOT IN (SELECT product_key FROM team_4.dim_product);

-- Check fact table metrics are reasonable
SELECT 
  COUNT(*) AS total_orders,
  SUM(line_total) AS total_sales,
  AVG(line_total) AS avg_line_total
FROM team_4.fct_sales;
```

---

## Troubleshooting

### "No tables created" or "Only 77 tables"
- Check for assertion blocks in SQLX configs
- Remove all `assertions` sections
- Assertions create extra validation tables

### "Source table not found"
- Verify source declarations in staging/sources.js
- Check project and dataset names are correct
- Ensure source tables exist in OLTP dataset

### "Dependency cycle detected"
- Facts should depend on dimensions, not vice versa
- Check dependencies array in config blocks
- Remove circular references

### "Permission denied"
- Verify Dataform service account has BigQuery Data Editor role
- Check both source and target datasets
- Grant permissions in IAM

### "Invalid SQLX syntax"
- Check for missing commas in SELECT clauses
- Verify ${ref()} syntax is correct
- Test SQL in BigQuery console first

---

## Best Practices Applied

**1. Star Schema Design**
- Clear fact/dimension separation
- Surrogate keys for dimensions
- Grain explicitly defined for each fact

**2. SQL Clarity**
- Descriptive column aliases
- Logical field ordering (keys, attributes, metrics)
- Comments for complex logic

**3. Incremental Development**
- Built smallest fact table first (product_reviews)
- Tested thoroughly before expanding
- Added complexity gradually

**4. Documentation**
- Descriptions in config blocks
- Clear table purposes
- Field-level documentation

**5. Performance**
- No unnecessary JOINs
- Pre-calculated metrics
- Appropriate data types

---

## Known Limitations

**By Design:**
- Full refresh only (no incremental builds)
- No slowly changing dimensions (SCD Type 2)
- Simple surrogate key generation (DENSE_RANK)
- No complex business rules

**For Production:**
- Add incremental builds for large facts
- Implement SCD Type 2 for key dimensions
- Add data quality tests
- Partition large fact tables
- Consider clustering keys

---

## File Structure

```
phase_3/
├── dataform/                       # Dataform project
│   ├── workflow_settings.yaml      # Configuration
│   ├── .gitignore
│   ├── definitions/
│   │   ├── staging/sources.js      # Source declarations
│   │   ├── dimensions/             # 14 .sqlx files
│   │   ├── facts/                  # 5 .sqlx files
│   │   └── views/                  # Optional helpers
│   ├── includes/helpers.js         # Utility functions
│   └── README.md                   # Dataform deployment
├── README.md                       # This file
└── prompt.txt                      # Build instructions
```

---

## Success Metrics

**Completeness:**
- ✅ 19 tables created (5 facts + 14 dimensions)
- ✅ All source tables properly declared (38 tables)
- ✅ Dependencies correctly defined
- ✅ No extra validation tables

**Quality:**
- ✅ All tables have data
- ✅ Row counts match expectations
- ✅ No duplicate keys in dimensions
- ✅ Foreign key integrity maintained

**Integration:**
- ✅ Phase 4 can create LookML views
- ✅ All explores work in Looker
- ✅ Phase 5 can query all data

---

## Learning Resources

- **Dataform Docs:** https://cloud.google.com/dataform/docs
- **SQLX Reference:** https://cloud.google.com/dataform/docs/sqlx-reference
- **Star Schema:** https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/
- **BigQuery Best Practices:** https://cloud.google.com/bigquery/docs/best-practices

---

## Status

**Phase 3:** ✅ Complete  
**Tables Created:** 19 (5 facts + 14 dimensions)  
**Data Range:** 2011-2014  
**Deployment:** Google Cloud Dataform  
**Integration:** Phase 4 compatible

---

**Built for the Adventure Works AI Hackathon**

*Transforming OLTP data into analytical star schema*

