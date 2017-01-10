var product = {
  "def" : {
    "code" : "700",
    "name" : "ASSISTANCE EN VOYAGE",
    "branch" : "700",
    "fromDate" : "2014-01-01",
    "toDate" : null,
    "status" : 1
  },
  "stamps" : [
    {
      "code" : "FGA",
      "amount" : 1
    }
  ],
  "covers" : [
    {
      "code" : "ASV",
      "name" : "ASSISTANCE EN VOYAGE",
      "commissions" : [
        {
          "profile" : "0XX",
          "rate" : 0
        },
        {
          "profile" : "2XX",
          "rate" : 0.1
        },
        {
          "profile" : "7XX",
          "rate" : 0.1
        },
        {
          "profile" : "1XX",
          "rate" : 0.05
        }
      ],
      "pricing" : [
        {
          "name" : "ZONE 1",
          "pricingRule" : "TABLE",
          "description" : "Tous les pays du monde sauf la Tunisie, les USA, le Canada, le Japon et l\'Australie",
          "values" : [
            {
              "period" : "7~days",
              "nameFr": "Sept (7) Jours",
              "premium" : 16.500,
              "soldPremium": 10.4
            },
            {
              "period" : "10~days",
              "nameFr": "Dix (10) Jours",
              "premium" : 18.500,
              "soldPremium": 11.6
            },
            {
              "period" : "15~days",
              "nameFr": "Quinze (15) Jours",
              "premium" : 22.500,
              "soldPremium": 14.2
            },
            {
              "period" : "21~days",
              "nameFr": "Vingt-et-un (21) Jours",
              "premium" : 28.500,
              "soldPremium": 18
            },
            {
              "period" : "1~months",
              "nameFr": "Un (1) Mois",
              "premium" : 32.500,
              "soldPremium": 20.7
            },
            {
              "period" : "2~months",
              "nameFr": "Deux (2) Mois",
              "premium" : 55,
              "soldPremium": 34.9
            },
            {
              "period" : "3~months",
              "nameFr": "Trois (3) Mois",
              "premium" : 75,
              "soldPremium": 47.8
            },
            {
              "period" : "6~months",
              "nameFr": "Six (6) Mois",
              "premium" : 93,
              "soldPremium": 59.5
            },
            {
              "period" : "1~years",
              "nameFr": "Une (1) Année",
              "premium" : 142.500,
              "soldPremium": 91,
              "flatRate" :[
                {
                  "name":"coupleWithoutChildren",
                  "value":203.500,
                  "soldPremium": 130
                },
                {
                  "name":"coupleWithChildren",
                  "value":292.500,
                  "soldPremium": 187
                }
              ]
            }
          ]
        },
        {
          "name" : "ZONE 2",
          "pricingRule" : "TABLE",
          "description" : "USA, Canada, Australie et Japon",
          "values" : [
            {
              "period" : "7~days",
              "nameFr": "Sept (7) Jours",
              "premium" : 30.500,
              "soldPremium": 19.4
            },
            {
              "period" : "10~days",
              "nameFr": "Dix (10) Jours",
              "premium" : 42.500,
              "soldPremium": 27.1
            },
            {
              "period" : "15~days",
              "nameFr": "Quinze (15) Jours",
              "premium" : 48.500,
              "soldPremium": 31
            },
            {
              "period" : "21~days",
              "nameFr": "Vingt-et-un (21) Jours",
              "premium" : 52.500,
              "soldPremium": 33.6
            },
            {
              "period" : "1~months",
              "nameFr": "Un (1) Mois",
              "premium" : 67,
              "soldPremium": 42.6
            },
            {
              "period" : "2~months",
              "nameFr": "Deux (2) Mois",
              "premium" : 105,
              "soldPremium": 67
            },
            {
              "period" : "3~months",
              "nameFr": "Trois (3) Mois",
              "premium" : 133.500,
              "soldPremium": 85.3
            },
            {
              "period" : "6~months",
              "nameFr": "Six (6) Mois",
              "premium" : 150,
              "soldPremium": 96
            },
            {
              "period" : "1~years",
              "nameFr": "Une (1) Année",
              "premium" : 230,
              "soldPremium": 147,
              "flatRate" :[
                {
                  "name":"coupleWithoutChildren",
                  "value":330,
                  "soldPremium": 211
                },
                {
                  "name":"coupleWithChildren",
                  "value":473.500,
                  "soldPremium": 303
                }
              ]
            }
          ]
        }
      ],
      "discount" : [
        {
          "name" : "personsNumber",
          "description" : "Rabais pour des groupes de personnes voyageant ensemble pour la même destination, et au même moment.",
          "values" : [
            {
              "min" : 10,
              "max" : 25,
              "rate" : 0.05
            },
            {
              "min" : 26,
              "max" : 100,
              "rate" : 0.1
            },
            {
              "min" : 101,
              "max" : 200,
              "rate" : 0.15
            },
            {
              "min" : 201,
              "max" : 1000000,
              "rate" : 0.25
            }
          ]
        }
      ],
      "overload" : [
        {
          "name" : "old",
          "description" : "Les surprimes à appliquer pour les personnes agées.",
          "values" : [
            {
              "min" : 65,
              "max" : 69,
              "rate" : 1.25
            },
            {
              "min" : 70,
              "max" : 74,
              "rate" : 1.5
            },
            {
              "min" : 75,
              "max" : 80,
              "rate" : 2
            }
          ]
        }
      ]      
    },
    {
      "code" : "FEE",
      "name" : "FRAIS",
      "commissions" : [
        {
          "profile" : "0XX",
          "rate" : 0
        },
        {
          "profile" : "2XX",
          "rate" : 0.2
        },
        {
          "profile" : "7XX",
          "rate" : 0.2
        },
        {
          "profile" : "1XX",
          "rate" : 0.1
        }
      ],
      "pricing" : [
        {
          "name" : "FRAIS",
          "description" : "Frais de gestion",
          "values" : [
            {
              "premium" : 2
            }
          ]
        }
      ]
      
    }
  ]
};
db.product.insert(product);