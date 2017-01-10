/* vim: fdm=marker
 */
angular.module('app')
  .service('savingsQuoteSvc', ['$q', '$http', 'savingsQuote',
    function ($q, $http, savingsQuote) {
      function create() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/quote/create', savingsQuote.toServer())
            .success(function (data) {
              savingsQuote.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function read(ref) {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/quote/read', {
              ref: ref
            })
            .success(function (data) {
              savingsQuote.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              savingsQuote.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function search(criteria) {
        //{{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/quote/search', {
              criteria: criteria
            })
            .success(function (data) {
              resolve(data);
            })
            .error(function (data, status) {
              savingsQuote.clear();
              reject(data || {
                status: status
              });
            });
        });
        //}}}
      }
      return {
        create: create,
        read: read,
        search: search
      };
    }
  ]);
