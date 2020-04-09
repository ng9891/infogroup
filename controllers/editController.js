const adminQuery = require('../services/adminQuery');
const byQuery = require('../services/byQuery');
let hstore = require('pg-hstore')();

function successHandler(data, response) {
  return response.status(200).json({
    data: data,
  });
}
function errorHandler(err, response) {
  console.error(err.stack);
  console.log(err.code);
  // Raise Exception
  if (err.code === 'P0001') {
    return response.status(500).json({
      status: 'invalid',
      responseText: err,
    });
  }

  if (err.code === '23514') {
    // specific for reqProposeBusinessChange()
    // Check fails on field 'changed_fields'. There were no changes found to the original data.
    return response.status(400).json({
      status: 'CHECK ERROR',
      responseText: 'No changes made',
    });
  }

  return response.status(500).json({
    status: 'Error',
    responseText: 'Error in query ' + err,
  });
}

exports.reqEditPage = async (request, response) => {
  // Render Edit page.
  return response.render('../views/proposal.ejs', {noSearchBar: true});
};

// This gives a pagination option for the datatable. In case loading time optimization is needed.
exports.reqEditListDatatable = (request, response) => {
  // console.log(request.query);
  let orderColIndex = request.query.order[0].column;
  let orderCol = request.query.columns[orderColIndex].data;
  // TODO: Implement search.
  adminQuery
    .editListDatatable(
      request.query.record_status,
      request.query.status,
      request.query.length,
      request.query.start,
      orderCol,
      request.query.order[0].dir
    )
    .then((data) => {
      if (data.length > 0) {
        return response.status(200).json({
          draw: parseInt(request.query.draw, 10),
          recordsTotal: parseInt(data[0].recordstotal, 10),
          recordsFiltered: parseInt(data[0].recordstotal, 10),
          data: data,
        });
      }
      return response.status(200).json({data: []});
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};

exports.reqEditList = (request, response) => {
  adminQuery
    .editList(request.query.limit, request.query.offset)
    .then((data) => {
      successHandler(data, response);
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};

exports.reqAcceptEdit = (request, response) => {
  if (!request.params.edit_id) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No edit id specified',
    });
  }

  adminQuery
    .acceptProposalById(request.params.edit_id, request.query.comment)
    .then(() => {
      return response.status(200).json({
        status: 'success',
        responseText: 'Successfully accepted',
      });
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};

exports.reqRejectEdit = (request, response) => {
  if (!request.params.edit_id) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No edit id specified',
    });
  }

  adminQuery
    .rejectProposalById(request.params.edit_id, request.query.comment)
    .then(() => {
      return response.status(200).json({
        status: 'success',
        responseText: 'Successfully rejected',
      });
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};

exports.reqWithdrawEdit = (request, response) => {
  if (!request.params.edit_id) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No edit id specified',
    });
  }

  adminQuery
    .withdrawProposalById(request.params.edit_id, request.query.comment)
    .then(() => {
      return response.status(200).json({
        status: 'success',
        responseText: 'Successfully withdrawn',
      });
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};

// Get a specific edit with an ID.
exports.reqEditListById = (request, response) => {
  if (!request.params.edit_id) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No edit id specified',
    });
  }
  // TODO: sanitize for param?
  adminQuery
    .editListById(request.params.edit_id, request.query.limit, request.query.offset)
    .then((data) => {
      successHandler(data, response);
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};

// Get the list of proposal/edit done by an user id.
exports.reqEditListByUserId = (request, response) => {
  if (!request.params.user_id) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No user id specified',
    });
  }
  // TODO: sanitize for param?
  adminQuery
    .editListByUserId(request.params.user_id, request.query.limit, request.query.offset)
    .then((data) => {
      successHandler(data, response);
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};

// Get the list of proposal/edit done on a business id.
exports.reqEditListByBusId = (request, response) => {
  if (!request.params.bus_id) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No business id specified',
    });
  }
  // TODO: sanitize for param?
  adminQuery
    .editListByBusId(request.params.bus_id, request.query.limit, request.query.offset)
    .then((data) => {
      successHandler(data, response);
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};

// Create a new edit proposal.
exports.reqProposeBusinessChange = async (request, response) => {
  if (!request.params.bus_id || isNaN(parseInt(request.params.bus_id, 10))) {
    return response.status(400).json({
      status: 'Error',
      responseText: 'No Business specified or is not correct',
    });
  }

  let [originalData] = await byQuery.geoById(request.params.bus_id);
  let originalForm = {
    alias: originalData['alias'],
    COMPANY_NAME: originalData['CONAME'],
    PRIMARY_SIC_CODE: originalData['PRMSICCD'],
    PRIMARY_SIC_DESC: originalData['PRMSICDS'],
    NAICS_CODE: originalData['NAICSCD'],
    NAICS_DESC: originalData['NAICSDS'],
    SQUARE_FOOTAGE_CODE: originalData['SQFOOTCD'],
    SQUARE_FOOTAGE_DESC: originalData['SQFOOTDS'],
    LOCATION_EMPLOYMENT_SIZE_CODE: originalData['LEMPSZCD'],
    LOCATION_EMPLOYMENT_SIZE_DESC: originalData['LEMPSZDS'],
    ACTUAL_LOCATION_EMPLOYMENT_SIZE: originalData['ALEMPSZ'],
    LOCATION_SALES_VOLUME_CODE: originalData['LSALVOLCD'],
    LOCATION_SALES_VOLUME_DESC: originalData['LSALVOLDS'],
    ACTUAL_LOCATION_SALES_VOLUME: originalData['ALSLSVOL'],
    CORPORATE_SALES_VOLUME_CODE: originalData['CSALVOLCD'],
    CORPORATE_SALES_VOLUME_DESC: originalData['CSALVOLDS'],
    ACTUAL_CORPORATE_SALES_VOLUME: originalData['ACSLSVOL'],
    PRIMARY_CITY: originalData['PRMCITY'],
    PRIMARY_STATE: originalData['PRMSTATE'],
    PRIMARY_ZIP_CODE: originalData['PRMZIP'],
    MATCH_LEVEL_CODE: originalData['MATCHCD'],
    LATITUDE_1: originalData['LATITUDEO'],
    LONGITUDE_1: originalData['LONGITUDEO'],
  };

  adminQuery
    .proposeBusinessChange(request.params.bus_id, request.body, originalForm, request.user)
    .then((data) => {
      return response.status(200).json({
        data: data,
      });
    })
    .catch((e) => {
      errorHandler(e, response);
    });
};
/*
  Record Status:
      0 - PROPOSED
      1 - WITHDRAWN
      2 - REJECTED
      3 - REPLACED
      4 - ACCEPTED
  Status:
      0 - INACTIVE / RETIRED
      1 - ACTIVE
 */
