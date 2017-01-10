/* vim: fdm=marker
 */
angular.module('app')
  .service('loanDraftSvc', ['$q', '$http', 'loanDraft', 'savingsQuote',
    function ($q, $http, loanDraft, savingsQuote) {
      function create() {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/loan/draft/create', {})
            .success(function (data) {
              loanDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              loanDraft.clear();
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
          $http.post('/svc/loan/draft/create', savingsQuote.toServer())
            .success(function (data) {
              loanDraft.fromServer(data);
              resolve(data);
            })
            .error(function (data, status) {
              loanDraft.clear();
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
          $http.post('/svc/loan/draft/read', {
              _id: id
            })
            .success(function (data) {
              loanDraft.fromServer(data);
              resolve();
            })
            .error(function (data, status) {
              loanDraft.clear();
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
          $http.post('/svc/loan/draft/update', loanDraft.toServer())
            .success(function (data) {
              loanDraft.fromServer(data);
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
          $http.post('/svc/loan/draft/request', {
              _id: loanDraft._id,
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
          $http.post('/svc/loan/draft/admin', loanDraft.toServer())
            .success(function (data) {
              loanDraft.fromServer(data);
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
          $http.post('/svc/loan/draft/check', {
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
