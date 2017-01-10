db.common.comboBox.insert({
	"def" : {
		"ref" : "frontierInsuranceListUsages",
		"branch" : "198",
		"date" : "2016-05-011",
		"addedBy" : "KCHAKA",
		"description" : "Assurance frontière: Liste des usages"
	},
	"params" : [
		{
			"code" : "MTC",
			"nameFr" : "Motocyclette",
			"nameAr" : "الدراجات النارية"
		},
		{
			"code" : "PPV",
			"nameFr" : "Véhicule particulier",
			"nameAr" : "الإستعمال الشخصي"
		},
		{
			"code" : "CAM",
			"nameFr" : "Camion",
			"nameAr" : "الشاحنات"
		},
		{
			"code" : "BUS",
			"nameFr" : "Autobus",
			"nameAr" : "الحافلات"
		}
	]
});
db.common.comboBox.insert({
	"def" : {
		"ref" : "frontierInsurancePeriodsList",
		"branch" : "198",
		"date" : "2016-05-11",
		"addedBy" : "KCHAKA",
		"description" : "Assurance frontière: Périodes d'assurance"
	},
	"params" : [
		{
			"code" : "8~days",
			"value" : "8 Jours"
		},
		{
			"code" : "15~days",
			"value" : "15 Jours"
		},
		{
			"code" : "30~days",
			"value" : "30 Jours"
		},
		{
			"code" : "2~months",
			"value" : "2 Mois"
		},
		{
			"code" : "3~months",
			"value" : "3 Mois"
		}
	]
});
db.common.comboBox.insert({
	"def" : {
		"ref" : "typeOfIDs",
		"date" : "2016-05-11",
		"addedBy" : "KCHAKA",
		"description" : "Type de pièces d'identité"
	},
	"params" : [
		{
			"code" : "CIN",
			"value" : "Carte d'identité nationale"
		},
		{
			"code" : "PASS",
			"value" : "Passeport"
		},
		{
			"code" : "CAS",
			"value" : "Carte de séjour"
		}
	]
});
db.common.comboBox.insert({
	"def" : {
		"ref" : "listOfCountries",
		"date" : "2016-05-11",
		"addedBy" : "KCHAKA",
		"description" : "Liste des pays"
	},
	"params" : [
		{
			"code" : "Alg",
			"value" : "Algérie"
		},
		{
			"code" : "Lby",
			"value" : "Libye"
		}
	]
});
