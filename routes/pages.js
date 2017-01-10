var path = require('path');
var _ = require('underscore');
var session = require('../logic/session');
var mongo = require('../mongo');
var test;

function generateNavs(id, req, callback) {
  var navs;
  var userPages;
  if (!req.session.user) {
    navs = [];
    callback(null, navs);
    return;
  }
  userPages = req.session.user.pages;
  if (!userPages) {
    userPages = [];
  }
  if (userPages.length === 0) {
    mongo.getUserCol()
      .findOne({
        'code': req.session.user.username
      }, function (err, user) {
        if (err) {
          callback(err);
          return;
        }
        navs = user.pages;
        req.session.user.pages = user.pages;
        var nav = _.find(navs, function (nav) {
          return (nav.id === id);
        });
        if (nav) {
          nav.active = true;
        }
        callback(null, navs);
        return;
      });
  }
  else {
    callback(null, userPages);
    return;
  }
}

function index(req, res) {
  generateNavs(null, req, function (err, navigations) {
    res.render('index', {
      title: 'At-Takafulia',
      navs: navigations,
      test: test
    });
  });
}

function auto(req, res) {
  generateNavs('auto', req, function (err, navigations) {
    res.render('auto', {
      title: 'At-Takafulia - Assurances Automobile',
      navs: navigations,
      test: test
    });
  });
}

function assistance(req, res) {
  generateNavs('assistance', req, function (err, navigations) {
    res.render('assistance', {
      title: 'At-Takafulia - Assistance en Voyage',
      navs: navigations,
      test: test
    });
  });
}

function loan(req, res) {
  generateNavs('loan', req, function (err, navigations) {
    res.render('loan', {
      title: 'At-Takafulia - Assurances Tamouil',
      navs: navigations,
      test: test
    });
  });
}

function finance(req, res) {
  generateNavs('finance', req, function (err, navigations) {
    res.render('finance', {
      title: 'At-Takafulia - Finance',
      navs: navigations,
      test: test,
      posCode: req.session.user.pos.code,
      posIndex: req.session.user.pos.code.substring(0, 1)
    });
  });
}

function admin(req, res) {
  generateNavs('admin', req, function (err, navigations) {
    res.render('admin', {
      title: 'At-Takafulia - Administration',
      navs: navigations,
      test: test
    });
  });
}

function family(req, res) {
  generateNavs('family', req, function (err, navigations) {
    res.render('family', {
      title: 'At-Takafulia - Family Takaful',
      navs: navigations,
      test: test
    });
  });
}

function familyPartial(req, res) {
  var partial = req.params.partial;
  if (!partial) {
    partial = 'index';
  }
  res.render(path.join('family', partial));
}

function mySpace(req, res) {
  generateNavs('mySpace', req, function (err, navigations) {
    res.render('mySpace', {
      title: 'At-Takafulia - Mon Espace',
      navs: navigations,
      test: test
    });
  });
}

function configs(req, res) {
  generateNavs('configs', req, function (err, navigations) {
    res.render('configs', {
      title: 'At-Takafulia - Paramètrage',
      navs: navigations,
      test: test
    });
  });
}

function smsapi(req, res) {
  generateNavs('smsapi', req, function (err, navigations) {
    res.render('smsapi', {
      title: 'At-Takafulia - SMS',
      navs: navigations,
      test: test
    });
  });
}

function smsapiPartial(req, res) {
  var partial = req.params.partial;
  if (!partial) {
    partial = 'index';
  }
  res.render(path.join('smsapi', partial));
}
/*
function msg(req, res) {
  generateNavs('msg', req, function (err, navigations) {
    res.render('msg', {
      title: 'At-Takafulia - SMS',
      navs: navigations,
      test: test
    });
  });
}

function msgPartial(req, res) {
  var partial = req.params.partial;
  if (!partial) {
    partial = 'index';
  }
  res.render(path.join('msg', partial));
}
*/
exports.declare = function (app) {
  if ('development' === app.get('env')) {
    test = true;
  }
  //Definition
  app.get('/', index);
  app.get('/auto', session.ensureAuth, auto);
  app.get('/assistance', session.ensureAuth, assistance);
  app.get('/family', family);
  app.get('/family/index', familyPartial);
  app.get('/family/:partial', session.ensureAuth, familyPartial);
  app.get('/loan', session.ensureAuth, loan);
  app.get('/finance', session.ensureAuth, session.ensurePosAdmin, finance);
  app.get('/admin', session.ensureInternal, session.ensureAuth, session.ensureAdmin,
    admin);
  app.get('/mySpace', session.ensureAuth, mySpace);
  app.get('/configs', session.ensureAuth, configs);
  app.get('/smsapi', smsapi);
  app.get('/smsapi/index', smsapiPartial);
  app.get('/smsapi/:partial', session.ensureAuth, smsapiPartial);
};
