function define(name, value) {
  Object.defineProperty(exports, name, {
    value: value,
    enumerable: true
  });
}
define('cActive', 'active');
define('cCanceled', 'canceled');
define('cSuspended', 'suspended');
define('cTerminated', 'terminated');
define('cDebit', 'debit');
define('cSent', 'sent');
define('cTreated', 'treated');
define('cRejected', 'rejected');
define('cReminded', 'reminded');
define('cBinder', 'binder');
define('cContract', 'contract');
