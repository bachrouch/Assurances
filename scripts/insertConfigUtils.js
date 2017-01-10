var configCommissionUtil = {
  def: {
    ref: 'CommConfigUtil',
    date: '2016-04-01',
    addedBy: 'SSA',
    description: 'Initializing confif for commission recalculate and processing'
  },
  params:[{
    name: 'Significant delta',
    value: 0.01
  }]
  };
db.config.utils.insert(configCommissionUtil);


db.finance.payment.update({commissionToPay:{$exists:true}},{$unset:{commissionToPay:''}},{multi:1})