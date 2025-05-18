const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const messages = require('../utils/message');
const { countyService } = require('../services');

const getCountyById = catchAsync(async (req, res) => {
  try {
    const county = await countyService.getCountyById(req.params.countyId);
    if (!county) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.send(county);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const getAllCounties = catchAsync(async (req, res) => {
  try {
    const counties = await countyService.getAllCounties();
    if (!counties) {
      throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
    }
    res.send(counties);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const createCounty = catchAsync(async (req, res) => {
  try {
    const county = await countyService.createCounty(req.body);
    res.status(httpStatus.CREATED).send(county);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

const updateCounty = catchAsync(async (req, res) => {
  try {
    const county = await countyService.updateCounty(req.body);
    res.status(httpStatus.OK).send(county);
  } catch (error) {
    res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).send({ error: error.message });
  }
});

module.exports = {
  getCountyById,
  getAllCounties,
  createCounty,
  updateCounty,
};
