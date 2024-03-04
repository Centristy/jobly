const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");


test('testing when data is added', function () {
    let result = sqlForPartialUpdate([2],[])
    expect(result).toEqual({"setCols": "\"0\"=$1", "values": [2]})
  });