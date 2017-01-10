/* vim: fdm=marker
 */
angular.module('app')
  .service('actorsSvc', ['$q', '$http',
    function ($q, $http) {
      function readPerson(id) {
        // {{{
        return $q(function (resolve, reject) {
          $http.post('/svc/actors/person/read', {
              id: id
            })
            .success(function (data) {
              resolve(data);
            })
            .error(function (data, status) {
              reject(data || {
                status: status
              });
            });
        });
        // }}} 
      }

      function setPerson(person) {
        //{{{
        return $q(function (resolve, reject) {
          $http.post('/svc/actors/person/set', {
              person: person
            })
            .success(function (data) {
              resolve(data);
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
        readPerson: readPerson,
        setPerson: setPerson
      };
    }
  ]);
