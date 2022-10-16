module.exports = {
  db_prefix: () => process.env.DB_PREFIX || '',
  preparePreagregations: (preAgregations) => {
   if (process.env.USE_OLD_PREAGREGATIONS == 'true'){
     return true
   }else {
       return false
   }
  }
};
