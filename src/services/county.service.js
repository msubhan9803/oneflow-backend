const httpStatus = require('http-status');
const { County } = require('../models');
const ApiError = require('../utils/ApiError');
const messages = require('../utils/message');

/**
 * Get county by id
 * @param {String} countyId
 * @returns {Promise<County>}
 */
const getCountyById = async (countyId) => {
  const county = await County.findById(countyId);
  if (!county) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  return county;
};

/**
 * Get All Counties
 * @returns {Promise<Array<County>>}
 */
const getAllCounties = async () => {
  const counties = await County.find();
  return counties;
};

/**
 * Post county
 * @param {Object} countyObj
 * @returns {Promise<County>}
 */
const createCounty = async (countyObj) => {
  const alreadyExistingCounty = await County.findOne({
    name: countyObj.name,
  });

  if (alreadyExistingCounty) {
    throw new ApiError(httpStatus.BAD_REQUEST, messages.ResourceAlreadyExists);
  }

  let county = new County(countyObj);

  if (countyObj.name.toLowerCase() === 'orange') {
    county.commercialRateList = Array(9).fill(0);
  } else {
    county.commercialRateList = Array(10).fill(0);
  }

  county.residentialRateList = Array(6).fill(0);

  county = await county.save();

  return county;
};

/**
 * Update county
 * @param {Object} countyObj
 * @returns {Promise<County>}
 */
const updateCounty = async (countyObj) => {
  const county = await County.findOne({
    _id: countyObj._id,
  });

  if (!county) {
    throw new ApiError(httpStatus.NOT_FOUND, messages.ResourceNotFound);
  }

  Object.assign(county, countyObj);

  await county.save();
  return county;
};

module.exports = {
  getCountyById,
  getAllCounties,
  createCounty,
  updateCounty,
};
