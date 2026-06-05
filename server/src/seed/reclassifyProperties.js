require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const connectDB = require("../config/db");
const Property = require("../models/Property");
const { classifyPropertyType } = require("../utils/classifyPropertyType");

async function reclassifyProperties() {
  await connectDB();

  const properties = await Property.find().select("_id title description type");
  const counts = { "Pre-Leased Office": 0, Shop: 0, other: 0 };

  for (const property of properties) {
    const nextType = classifyPropertyType(property.title, property.description);
    if (property.type !== nextType) {
      await Property.updateOne({ _id: property._id }, { $set: { type: nextType } });
    }

    if (nextType === "Pre-Leased Office" || nextType === "Shop") {
      counts[nextType] += 1;
    } else {
      counts.other += 1;
    }
  }

  console.log(`Reclassified ${properties.length} properties`);
  console.log(`Pre-Leased Office: ${counts["Pre-Leased Office"]}`);
  console.log(`Shop: ${counts.Shop}`);
  if (counts.other) console.log(`Other: ${counts.other}`);

  process.exit(0);
}

reclassifyProperties().catch((error) => {
  console.error("Reclassification failed:", error.message);
  process.exit(1);
});
