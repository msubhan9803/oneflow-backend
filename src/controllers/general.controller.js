const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { generalService } = require('../services');

const getAllCountries = catchAsync(async (req, res) => {
  try {
    const countries = await generalService.getAllCountries();

    res.send(countries);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

module.exports = {
  getAllCountries,
};
