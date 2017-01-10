/* vim: fdm=marker
 */
function readPerson(id) {
  // {{{
  if (id === '12345678') {
    return {
      reference: '32165',
      id: '12345678',
      gender: 'm',
      firstName: 'Ali',
      name: 'Kefia',
      birthDate: '1981-06-06',
      phone: '31331806',
      mobile: '58366646',
      email: 'ali.kefia@attakafulia.tn',
      address: '15 rue de Jérusalem 1002 Tunis'
    };
  }
  // }}}
}

function setPerson(person) {
  console.log('person set ' + person.id);
}
exports.readPerson = readPerson;
exports.setPerson = setPerson;
