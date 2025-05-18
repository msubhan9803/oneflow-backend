/* eslint-disable no-param-reassign */

const aggregatedPaginate = (schema) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of documents
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
   * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  schema.statics.aggregatedPaginate = async function (caseInsensitiveFilter, options, aggregateQuery) {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria = {};
      options.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria[key] = order === 'desc' ? -1 : 1;
      });
      sort = { $sort: sortingCriteria };
    } else {
      sort = { $sort: { createdAt: 1 } };
    }

    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const skip = { $skip: (page - 1) * limit };
    const limitStage = { $limit: limit };

    // Adding the stages to the aggregate query
    aggregateQuery.push(sort);

    // const countPromise = this.countDocuments(caseInsensitiveFilter).exec();

    // Create a copy of aggregateQuery
    const countAggregateQuery = [...aggregateQuery];

    // Add a $count stage at the end of the pipeline to get the count of matching documents
    countAggregateQuery.push({ $count: 'totalResults' });
    countAggregateQuery.push({ $unwind: '$totalResults' });

    aggregateQuery.push(skip);
    aggregateQuery.push(limitStage);

    // Now run this new pipeline to get the count of matching documents
    const countPromise = this.aggregate(countAggregateQuery).exec();

    const docsPromise = this.aggregate(aggregateQuery).exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [countResult, results] = values;
      const totalResults = countResult.length ? countResult[0].totalResults : 0;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        results,
        page,
        limit,
        recordsCount: results.length,
        totalPages,
        totalResults,
      };
      return Promise.resolve(result);
    });
  };
};

module.exports = aggregatedPaginate;
