require("dotenv").config();
const mongoose = require("mongoose");
const Property = require("../models/Property");
const CoworkingSpace = require("../models/CoworkingSpace");
const { generateCoverImage } = require("../utils/imageThumbnail");

async function backfillModel(Model, label) {
  const docs = await Model.find({
    $or: [{ coverImage: { $exists: false } }, { coverImage: "" }],
    images: { $exists: true, $ne: [] },
  }).select("title images coverImage");

  let updated = 0;

  for (const doc of docs) {
    const coverImage = await generateCoverImage(doc.images[0]);
    if (!coverImage) continue;
    doc.coverImage = coverImage;
    await doc.save();
    updated += 1;
    console.log(`[${label}] ${doc.title} -> cover ready (${coverImage.length} chars)`);
  }

  return updated;
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const propertyCount = await backfillModel(Property, "property");
  const coworkingCount = await backfillModel(CoworkingSpace, "coworking");
  console.log(`Done. Updated ${propertyCount} properties and ${coworkingCount} coworking spaces.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
