-- "Shop" is no longer a category on the site; reword listing titles to match
-- (same rules as removeShopWording in src/utils/listingType.js).
UPDATE "properties"
SET "title" = regexp_replace(
      regexp_replace(
        regexp_replace("title", '\mshop\s+no\M', 'Unit No', 'gi'),
        '\mretail\s+shops?\M', 'Retail', 'gi'),
      '\mshops?\M', 'Retail', 'gi')
WHERE "title" ~* '\mshops?\M';
