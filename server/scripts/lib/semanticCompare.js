function sameId(mongoDoc, prismaDoc) {
  if (!mongoDoc && !prismaDoc) return true;
  if (!mongoDoc || !prismaDoc) return false;
  return String(mongoDoc._id) === String(prismaDoc._id);
}

function checkFields(mongoDoc, prismaDoc, fields) {
  if (!mongoDoc && !prismaDoc) return true;
  if (!mongoDoc || !prismaDoc) return false;
  return fields.every((field) => {
    const a = mongoDoc[field];
    const b = prismaDoc[field];
    if (a === undefined && b === undefined) return true;
    return String(a ?? "") === String(b ?? "");
  });
}

function result(match, op, details = {}) {
  return { op, match, ...details };
}

module.exports = {
  sameId,
  checkFields,
  result,
};
