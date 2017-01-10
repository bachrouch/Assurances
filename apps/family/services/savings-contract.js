/* vim: fdm=marker
 */
angular.module('app')
  .service('savingsContractSvc', ['$q', '$http', 'savingsContract',
    function ($q, $http, savingsContract) {
      function create() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/create', savingsContract.toServer())
            .success(function (data) {
              savingsContract.fromServer(data);
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
          $http.post('/svc/savings/contract/read', {
              ref: ref
            })
            .success(function (data) {
              savingsContract.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              savingsContract.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function saveFreeDeposit() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/saveFreeDeposit',
              savingsContract.toServer())
            .success(function (data) {
              savingsContract.fromServer(data);
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

      function search(criteria) {
        //{{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/search', {
              criteria: criteria
            })
            .success(function (data) {
              resolve(data);
            })
            .error(function (data, status) {
              savingsContract.clear();
              reject(data || {
                status: status
              });
            });
        });
        //}}}
      }

      function check(right) {
        //{{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/check', {
              right: right
            })
            .success(function () {
              resolve();
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        //}}}
      }

      function domiciliate() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/domiciliate', savingsContract
              .toServer())
            .success(function (data) {
              savingsContract.fromServer(data);
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

      function validate() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/contract/validate', savingsContract.toServer())
            .success(function (data) {
              savingsContract.fromServer(data);
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
      return {
        create: create,
        read: read,
        saveFreeDeposit: saveFreeDeposit,
        search: search,
        check: check,
        validate: validate,
        domiciliate: domiciliate
      };
    }
  ]);
