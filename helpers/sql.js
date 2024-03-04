const { BadRequestError } = require("../expressError");

/**

*Helps with certain modules in SQL queries\

dataToUpdate Object {field1:value1, field2: value2,....}

jsToSql maps js --> data fields names in table columns

returns object sqlSetCols, dataToUpdate


*/



function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
