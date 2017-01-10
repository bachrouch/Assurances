var newPage = {
	"id" : "configs",
			"path" : "/configs",
			"label" : "Paramètrage",
			"active" : false,
			"items" : [
				{
					"label" : "Produit",
					"path" : "/configs#product"
				}
				]};
db.user.update({code: 'SSADDEM'}, {$push: {pages: newPage}});
db.user.update({code: 'SSADDEM'}, {$set: {'accessRights.productConfig': true}});