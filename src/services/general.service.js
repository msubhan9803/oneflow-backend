const countryList = require('../utils/countriesList');

/**
 * Get All Countrie
 * @returns {Promise<County>}
 */
const getAllCountries = async () => {
  return countryList;
};

module.exports = {
  getAllCountries,
};
