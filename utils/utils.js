module.exports = {
  convertMilesToMeters: (val) => {
    return val / 0.00062137;
  },
  columnNames: {
    id: 'id',
    geom: 'geom',
    CONAME: 'COMPANY_NAME',
    PRMADDR: 'PRIMARY_ADDRESS',
    PRMCITY: 'PRIMARY_CITY',
    PRMSTATE: 'PRIMARY_STATE',
    PRMZIP: 'PRIMARY_ZIP_CODE',
    COUNTY: 'COUNTY_NAME',
    LEMPSZDS: 'LOCATION_EMPLOYMENT_SIZE_DESC',
    LEMPSZCD: 'LOCATION_EMPLOYMENT_SIZE_CODE',
    ALEMPSZ: 'ACTUAL_LOCATION_EMPLOYMENT_SIZE',
    LSALVOLDS: 'LOCATION_SALES_VOLUME_DESC',
    LSALVOLCD: 'LOCATION_SALES_VOLUME_CODE',
    ALSLSVOL: 'ACTUAL_LOCATION_SALES_VOLUME',
    NAICSDS: 'NAICS_DESC',
    NAICSCD: 'NAICS_CODE',
    PRMSICCD: 'PRIMARY_SIC_CODE',
    PRMSICDS: 'PRIMARY_SIC_DESC',
    SQFOOTCD: 'SQUARE_FOOTAGE_CODE',
    SQFOOTDS: 'SQUARE_FOOTAGE_DESC',
    CSALVOLCD: 'CORPORATE_SALES_VOLUME_CODE',
    CSALVOLDS: 'CORPORATE_SALES_VOLUME_DESC',
    ACSLSVOL: 'ACTUAL_CORPORATE_SALES_VOLUME',
    ACEMPSZ: 'ACTUAL_CORPORATE_EMPLOYMENT_SIZE',
    MATCHCD: 'MATCH_LEVEL_CODE',
    INDIVIDUAL_FIRM_CODE: 'INDIVIDUAL_FIRM_CODE',
    INDIVIDUAL_FIRM_DESC: 'INDIVIDUAL_FIRM_DESC',
    YEAR_SIC_ADDED: 'YEAR_SIC_ADDED',
    BIG_BUSINESS: 'BIG_BUSINESS',
    HIGHTECHBUSINESS: 'HIGHTECHBUSINESS',
    LATITUDEO: 'LATITUDE_1',
    LONGITUDEO: 'LONGITUDE_1',
  },
  tableNames:{
    business: 'businesses',
  }
};
