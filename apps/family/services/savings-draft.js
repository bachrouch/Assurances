/* vim: fdm=marker
 */
angular.module('app')
  .service('savingsDraftSvc', ['$q', '$http', 'savingsDraft', 'savingsQuote',
    function ($q, $http, savingsDraft, savingsQuote) {
      function create() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/create', {})
            .success(function (data) {
              savingsDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              savingsDraft.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function createFromQuote() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/create', savingsQuote.toServer())
            .success(function (data) {
              savingsDraft.fromServer(data);
              resolve(data);
            })
            .error(function (data, status) {
              savingsDraft.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function read(id) {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/read', {
              _id: id
            })
            .success(function (data) {
              savingsDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              savingsDraft.clear();
              reject(data || {
                status: status
              });
            });
        });
        // }}}
      }

      function update() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/update', savingsDraft.toServer())
            .success(function (data) {
              savingsDraft.fromServer(data);
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

      function request(msg) {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/request', {
              _id: savingsDraft._id,
              msg: msg
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
        // }}}
      }

      function admin() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/admin', savingsDraft.toServer())
            .success(function (data) {
              savingsDraft.fromServer(data);
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

      function check(right) {
        //{{{
        return $q(function (resolve, reject) {
          $http.post('/svc/savings/draft/check', {
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
      return {
        create: create,
        createFromQuote: createFromQuote,
        read: read,
        update: update,
        request: request,
        admin: admin,
        check: check
      };
    }
  ]);
